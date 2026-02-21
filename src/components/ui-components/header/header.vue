<script setup lang="ts">
  import type { Langs, PickerType } from '../../types';
  import LocaleToggle from './components/LocaleToggle.vue';
  import MonthYearLabel from './components/MonthYearLabel.vue';
  import NavArrow from './components/NavArrow.vue';

  interface HeaderColumn {
    monthLabel: string;
    year: number;
  }

  defineProps<{
    type: PickerType;
    locale: string;
    lang: Langs[string];
    tabIndex?: number;
    nextLocale: string;
    columnCount: number;
    canGoPrevMonth: boolean;
    canGoNextMonth: boolean;
    columns: HeaderColumn[];
  }>();

  const emit = defineEmits<{
    (e: 'change-locale'): void;
    (e: 'change-month', direction: 'add' | 'sub'): void;
    (e: 'show-part', part: 'month' | 'year'): void;
  }>();
</script>

<template>
  <div v-if="type.includes('date')" class="pdp-header">
    <LocaleToggle
      v-if="locale.includes(',')"
      :text="lang.translations.text"
      :next-locale="nextLocale"
      :tab-index="tabIndex"
      @change-locale="emit('change-locale')"
    />

    <div class="bottom">
      <NavArrow
        direction="prev"
        :disabled="!canGoPrevMonth"
        :title="lang.translations.prevMonth"
        @click="emit('change-month', 'sub')"
      >
        <slot name="right-arrow"></slot>
      </NavArrow>

      <div>
        <MonthYearLabel
          v-for="(column, i) in columns"
          :key="i"
          :month-label="column.monthLabel"
          :year="column.year"
          @show-part="emit('show-part', $event)"
        />
      </div>

      <NavArrow
        direction="next"
        :disabled="!canGoNextMonth"
        :title="lang.translations.nextMonth"
        @click="emit('change-month', 'add')"
      >
        <slot name="left-arrow"></slot>
      </NavArrow>
    </div>
  </div>
</template>
