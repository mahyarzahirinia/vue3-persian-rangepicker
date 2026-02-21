<script setup lang="ts">
  /**
   * TODO: use scoped slots
   * TODO: add time config
   * TODO: add tip for days
   * TODO: test the project with attention and test in nuxt
   * TODO: refactor and write comment --> pay a high attention
   */

  import { ref, useAttrs, computed, watch, nextTick } from 'vue';

  // ************************ Core ************************
  import { PersianDate, Core } from './utils/modules/core';

  // ************************ Types ************************
  import type { DatePickerProps, SubmitPayload } from './types';

  // ************************ Composable ************************
  import { useDatePicker } from './useDatePicker';

  // ************************ Components ************************
  import PDPArrow from './ui-components/PDPArrow.vue';
  import PDPIcon from './ui-components/PDPIcon.vue';
  import PDPAlt from './ui-components/PDPAlt.vue';
  import DatePickerHeader from './ui-components/header/header.vue';
  import DatePickerMain from './ui-components/main/main.vue';
  import DatePickerFooter from './ui-components/footer/footer.vue';

  defineOptions({
    name: 'ZahiriniyaRangePicker',
    inheritAttrs: false,
  });

  // -------------------- props --------------------
  const props = withDefaults(defineProps<DatePickerProps>(), {
    type: 'date',
    show: false,
    clickOn: 'all',
    modal: false,
    column: () => ({ 576: 1 }),
    autoSubmit: true,
    mode: 'range',
    locale: 'fa',
    clearable: false,
    dualInput: false,
    iconInside: false,
    shortcut: false,
    uiMode: 'inline',
  });

  const isInline = computed(() => props.uiMode === 'inline');
  const isDialog = computed(() => props.uiMode === 'dialog');

  // -------------------- events --------------------
  const emit = defineEmits<{
    (e: 'open'): void;
    (e: 'close'): void;
    (e: 'select', date: PersianDate): void;
    (e: 'submit', payload: SubmitPayload): void;
    (e: 'clear'): void;
    (
      e: 'update:modelValue',
      value:
        | string
        | string[]
        | null
        | (string | null)[]
        | PersianDate
        | PersianDate[],
    ): void;
  }>();

  const rawAttrs = useAttrs() as Record<string, unknown>;

  // -------------------- template refs --------------------
  const root = ref<HTMLElement | null>(null);
  const inputsRef = ref<HTMLInputElement[]>([]);
  const pdpPicker = ref<HTMLElement | null>(null);
  const pdpSelectYear = ref<HTMLElement | null>(null);
  const pdpMain = ref<HTMLElement | null>(null);
  const dialogPortal = ref<HTMLElement | null>(null);

  const {
    // state
    core,
    onDisplay,
    showDatePicker,
    showYearSelect,
    showMonthSelect,
    displayValue,
    // inputName,
    submittedValue,
    selectedDates,
    // computed
    lang,
    attrs,
    years,
    columnCount,
    monthDays,
    months,
    nextLocale,
    selectedTimesList,
    formats,
    inputs,
    tabIndex,
    shortcuts,
    canGoPrevMonth,
    canGoNextMonth,
    headerColumns,
    langWeekdays,
    timeDisabled,
    footerStartText,
    footerEndText,
    canGoToday,
    canSubmit,
    // methods
    showPart,
    changeSelectedMonth,
    changeSelectedYear,
    selectDate,
    goToToday,
    showPicker,
    selectWithArrow,
    // selectInRangeDate,
    submitDate,
    changeLocale,
    clear,
    startChangeTime,
    stopChangeTime,
    selectShorcut,
  } = useDatePicker(
    props,
    emit,
    { root, inputsRef, pdpPicker, pdpSelectYear, pdpMain },
    rawAttrs,
  );

  // Apply color/styles to the teleported dialog portal so it inherits the theme.
  function applyThemeToPortal(): void {
    if (!dialogPortal.value) return;
    Core.setColor(props.color, dialogPortal.value);
    Core.setStyles(props.styles, dialogPortal.value);
  }

  watch(
    () => showDatePicker.value,
    (val) => {
      if (val && isDialog.value) {
        void nextTick(applyThemeToPortal);
      }
    },
  );

  watch(
    () => props.color,
    () => {
      if (isDialog.value) void nextTick(applyThemeToPortal);
    },
  );

  watch(
    () => props.styles,
    () => {
      if (isDialog.value) void nextTick(applyThemeToPortal);
    },
    { deep: true },
  );
</script>

<script lang="ts">
  export { PersianDate } from './utils/modules/core';
</script>

<template>
  <div
    ref="root"
    :class="[
      'pdp',
      { 'pdp-range': mode === 'range' },
      { 'pdp-modal': modal },
      { 'pdp-dual': dualInput },
      { 'pdp-ui-inline': isInline },
      { 'pdp-ui-dialog': isDialog },
      lang.dir.input,
    ]"
  >
    <slot name="before">
      <label v-if="label" :for="attrs.firstInput.id" v-bind="attrs.label">
        {{ label }}
      </label>
    </slot>

    <div v-bind="attrs.div">
      <template v-for="(input, index) in inputs" :key="input">
        <div
          v-if="!$slots.hasOwnProperty('icon') || $slots?.icon?.()?.length"
          :key="`icon-${input}`"
          :class="[
            'pdp-icon',
            { 'pdp-pointer': ['all', 'icon'].includes(props.clickOn) },
            { 'pdp-inside': iconInside },
          ]"
          @click="showPicker('icon', index as 0 | 1)"
        >
          <slot name="icon">
            <PDPIcon :icon="props.type" width="23" height="23"></PDPIcon>
          </slot>
        </div>

        <input
          ref="inputsRef"
          v-model="displayValue[index]"
          type="text"
          autocomplete="off"
          v-bind="attrs[input]"
          @focus="showPicker('input', index as 0 | 1)"
          @keydown="selectWithArrow"
        />

        <button
          v-if="clearable"
          :key="`clear-${input}`"
          class="pdp-clear"
          type="button"
          @click="clear(input)"
        >
          <slot name="clear"><PDPIcon icon="clear"></PDPIcon></slot>
        </button>
      </template>
    </div>

    <slot name="after"></slot>

    <PDPAlt
      v-if="attrs.alt.name"
      :name="attrs.alt.name"
      :format="formats.alt"
      :dates="submittedValue"
    />

    <!-- Picker: shown on interaction for all modes -->
    <template v-if="showDatePicker">
      <!-- Dialog mode: teleport to body with a centered overlay -->
      <Teleport v-if="isDialog" to="body">
        <div
          ref="dialogPortal"
          class="pdp pdp-ui-dialog-portal"
          :class="lang.dir.input"
        >
          <div
            class="pdp-overlay pdp-dialog-overlay"
            @click="showDatePicker = false"
          ></div>
          <div
            ref="pdpPicker"
            :class="['pdp-picker', 'pdp-picker-dialog', lang.dir.picker]"
          >
            <div class="pdp-auto">
              <div v-if="props.type.includes('date')">
                <ul v-show="showMonthSelect" class="pdp-select-month">
                  <li
                    v-for="(month, index) in months"
                    :key="index"
                    :class="[
                      { selected: month.selected },
                      { disabled: month.disabled },
                    ]"
                    @click="changeSelectedMonth(Number(index))"
                  >
                    {{ month.label }}
                  </li>
                </ul>
                <ul
                  v-show="showYearSelect"
                  ref="pdpSelectYear"
                  class="pdp-select-year"
                >
                  <li
                    v-for="(year, index) in years"
                    :key="index"
                    :class="{ selected: onDisplay?.year() == year }"
                    @click="changeSelectedYear(year)"
                  >
                    {{ year }}
                  </li>
                </ul>
              </div>

              <DatePickerHeader
                :type="props.type"
                :locale="props.locale"
                :lang="lang"
                :tabIndex="tabIndex"
                :nextLocale="nextLocale"
                :columnCount="columnCount"
                :canGoPrevMonth="canGoPrevMonth"
                :canGoNextMonth="canGoNextMonth"
                :columns="headerColumns"
                @change-locale="changeLocale"
                @change-month="changeSelectedMonth"
                @show-part="showPart"
              >
                <template #right-arrow>
                  <slot name="right-arrow">
                    <PDPArrow
                      direction="right"
                      width="10"
                      height="10"
                      :inverse="lang.dir.picker == 'ltr'"
                    ></PDPArrow>
                  </slot>
                </template>
                <template #left-arrow>
                  <slot name="left-arrow">
                    <PDPArrow
                      direction="left"
                      width="10"
                      height="10"
                      :inverse="lang.dir.picker == 'ltr'"
                    ></PDPArrow>
                  </slot>
                </template>
              </DatePickerHeader>

              <div ref="pdpMain" class="pdp-main">
                <DatePickerMain
                  :type="props.type"
                  :mode="props.mode"
                  :columnCount="columnCount"
                  :langWeekdays="langWeekdays"
                  :monthDays="monthDays"
                  :selectedTimes="selectedTimesList"
                  :core="core"
                  :timeDisabled="timeDisabled"
                  @select-date="selectDate"
                  @start-change-time="
                    ({ timeIndex, unit, operator }) =>
                      startChangeTime(timeIndex, unit, operator)
                  "
                  @stop-change-time="stopChangeTime"
                >
                  <template #up-arrow
                    ><slot name="up-arrow"><PDPArrow></PDPArrow></slot
                  ></template>
                  <template #down-arrow
                    ><slot name="down-arrow"
                      ><PDPArrow direction="down"></PDPArrow></slot
                  ></template>
                </DatePickerMain>
              </div>

              <DatePickerFooter
                :startText="footerStartText"
                :endText="footerEndText"
                :tabIndex="tabIndex"
                :canGoToday="canGoToday"
                :canSubmit="canSubmit"
                :nowLabel="lang.translations.now"
                :submitLabel="lang.translations.submit"
                @go-today="goToToday"
                @submit="submitDate()"
              >
                <template #footer><slot name="footer"></slot></template>
              </DatePickerFooter>
            </div>

            <ul
              v-if="shortcuts && Object.keys(shortcuts).length > 0"
              class="pdp-shortcut"
            >
              <li
                v-for="(dates, name) in shortcuts"
                :key="name"
                :class="{
                  selected: !dates.some(
                    (date, i) =>
                      !date.isSame(
                        selectedDates[i] &&
                          selectedDates[i].toString('datetime'),
                      ),
                  ),
                }"
                @click="selectShorcut(dates)"
              >
                {{ name }}
              </li>
            </ul>
          </div>
        </div>
      </Teleport>

      <!-- Inline and default dropdown modes -->
      <template v-if="!isDialog">
        <div class="pdp-overlay" @click="showDatePicker = false"></div>

        <div
          v-bind="attrs.picker"
          :class="isInline ? 'pdp-picker-inline' : undefined"
          ref="pdpPicker"
        >
          <div class="pdp-auto">
            <div v-if="props.type.includes('date')">
              <ul v-show="showMonthSelect" class="pdp-select-month">
                <li
                  v-for="(month, index) in months"
                  :key="index"
                  :class="[
                    { selected: month.selected },
                    { disabled: month.disabled },
                  ]"
                  @click="changeSelectedMonth(Number(index))"
                >
                  {{ month.label }}
                </li>
              </ul>

              <ul
                v-show="showYearSelect"
                ref="pdpSelectYear"
                class="pdp-select-year"
              >
                <li
                  v-for="(year, index) in years"
                  :key="index"
                  :class="{ selected: onDisplay?.year() == year }"
                  @click="changeSelectedYear(year)"
                >
                  {{ year }}
                </li>
              </ul>
            </div>

            <DatePickerHeader
              :type="props.type"
              :locale="props.locale"
              :lang="lang"
              :tabIndex="tabIndex"
              :nextLocale="nextLocale"
              :columnCount="columnCount"
              :canGoPrevMonth="canGoPrevMonth"
              :canGoNextMonth="canGoNextMonth"
              :columns="headerColumns"
              @change-locale="changeLocale"
              @change-month="changeSelectedMonth"
              @show-part="showPart"
            >
              <template #right-arrow>
                <slot name="right-arrow">
                  <PDPArrow
                    direction="right"
                    width="10"
                    height="10"
                    :inverse="lang.dir.picker == 'ltr'"
                  ></PDPArrow>
                </slot>
              </template>

              <template #left-arrow>
                <slot name="left-arrow">
                  <PDPArrow
                    direction="left"
                    width="10"
                    height="10"
                    :inverse="lang.dir.picker == 'ltr'"
                  ></PDPArrow>
                </slot>
              </template>
            </DatePickerHeader>

            <div ref="pdpMain" class="pdp-main">
              <DatePickerMain
                :type="props.type"
                :mode="props.mode"
                :columnCount="columnCount"
                :langWeekdays="langWeekdays"
                :monthDays="monthDays"
                :selectedTimes="selectedTimesList"
                :core="core"
                :timeDisabled="timeDisabled"
                @select-date="selectDate"
                @start-change-time="
                  ({ timeIndex, unit, operator }) =>
                    startChangeTime(timeIndex, unit, operator)
                "
                @stop-change-time="stopChangeTime"
              >
                <template #up-arrow>
                  <slot name="up-arrow">
                    <PDPArrow></PDPArrow>
                  </slot>
                </template>

                <template #down-arrow>
                  <slot name="down-arrow">
                    <PDPArrow direction="down"></PDPArrow>
                  </slot>
                </template>
              </DatePickerMain>
            </div>

            <DatePickerFooter
              :startText="footerStartText"
              :endText="footerEndText"
              :tabIndex="tabIndex"
              :canGoToday="canGoToday"
              :canSubmit="canSubmit"
              :nowLabel="lang.translations.now"
              :submitLabel="lang.translations.submit"
              @go-today="goToToday"
              @submit="submitDate()"
            >
              <template #footer>
                <slot name="footer"></slot>
              </template>
            </DatePickerFooter>
          </div>

          <ul
            v-if="shortcuts && Object.keys(shortcuts).length > 0"
            class="pdp-shortcut"
          >
            <li
              v-for="(dates, name) in shortcuts"
              :key="name"
              :class="{
                selected: !dates.some(
                  (date, i) =>
                    !date.isSame(
                      selectedDates[i] && selectedDates[i].toString('datetime'),
                    ),
                ),
              }"
              @click="selectShorcut(dates)"
            >
              {{ name }}
            </li>
          </ul>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
  @use './assets/sass/app.scss';
</style>
