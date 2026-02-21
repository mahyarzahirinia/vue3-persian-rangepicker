<script setup lang="ts">
  import type { MonthDays, Mode, PickerType, PersianDate } from '../../types';

  defineProps<{
    type: PickerType;
    mode: Mode;
    columnCount: number;
    langWeekdays: string[];
    monthDays: MonthDays[][][];
    /** Time selections (locale-aware: jalali or gregorian depending on locale). */
    selectedTimes: PersianDate[];
    core: PersianDate;
    timeDisabled: boolean[];
  }>();

  const emit = defineEmits<{
    (e: 'select-date', date: PersianDate, part: 'date'): void;
    (
      e: 'start-change-time',
      payload: {
        timeIndex: number;
        unit: 'minute' | 'hour';
        operator: 'add' | 'sub';
      },
    ): void;
    (e: 'stop-change-time'): void;
  }>();
</script>

<template>
  <div>
    <div v-if="type.includes('date')" class="pdp-date">
      <div
        v-for="(item, i) in columnCount"
        :key="i"
        class="pdp-column"
        :data-column="i"
      >
        <div class="pdp-week">
          <div
            v-for="(weekday, index) in langWeekdays"
            :key="index"
            class="pdp-weekday"
          >
            {{ weekday }}
          </div>
        </div>

        <div class="pdp-days">
          <div v-for="(week, wIndex) in monthDays[i]" :key="wIndex">
            <div
              v-for="day in week"
              :key="day.raw ? day.raw.toString() : undefined"
              :class="[
                'pdp-day',
                { empty: day.empty },
                { friday: day.friday },
                { today: day.today },
                { 'start-range': day.startRange },
                { 'end-range': day.endRange },
                { disabled: day.disabled },
                { 'in-range': day.inRange },
              ]"
              :value="day.val"
              @click="day.raw && emit('select-date', day.raw, 'date')"
            >
              {{ day.val }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="type.includes('time')" class="pdp-time inline">
      <div v-if="type == 'time'" class="pdp-column">
        <div v-for="(c, i) in columnCount" :key="i"></div>
      </div>

      <div
        :class="[
          'pdp-moment',
          { 'column-direction': mode == 'range' && columnCount == 1 },
        ]"
      >
        <div
          v-for="(n, i) in mode == 'range' ? 2 : 1"
          :key="n"
          :class="[{ disabled: timeDisabled[i] }]"
        >
          <div class="hour">
            <button
              type="button"
              @touchstart.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'add',
                })
              "
              @mousedown.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'add',
                })
              "
              @keydown.enter.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'add',
                })
              "
              @touchend.prevent="emit('stop-change-time')"
              @mouseup.prevent="emit('stop-change-time')"
              @keyup.enter.prevent="emit('stop-change-time')"
            >
              <slot name="up-arrow"></slot>
            </button>

            {{
              selectedTimes[i] ? selectedTimes[i].hour('HH') : core.hour('HH')
            }}

            <button
              type="button"
              @touchstart.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'sub',
                })
              "
              @mousedown.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'sub',
                })
              "
              @keydown.enter.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'hour',
                  operator: 'sub',
                })
              "
              @touchend.prevent="emit('stop-change-time')"
              @mouseup.prevent="emit('stop-change-time')"
              @keyup.enter.prevent="emit('stop-change-time')"
            >
              <slot name="down-arrow"></slot>
            </button>
          </div>

          :
          <div class="minute">
            <button
              type="button"
              @touchstart.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'add',
                })
              "
              @mousedown.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'add',
                })
              "
              @keydown.enter.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'add',
                })
              "
              @touchend.prevent="emit('stop-change-time')"
              @mouseup.prevent="emit('stop-change-time')"
              @keyup.enter.prevent="emit('stop-change-time')"
            >
              <slot name="up-arrow"></slot>
            </button>

            {{
              selectedTimes[i]
                ? selectedTimes[i].minute('mm')
                : core.minute('mm')
            }}

            <button
              type="button"
              @touchstart.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'sub',
                })
              "
              @mousedown.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'sub',
                })
              "
              @keydown.enter.prevent="
                emit('start-change-time', {
                  timeIndex: i,
                  unit: 'minute',
                  operator: 'sub',
                })
              "
              @touchend.prevent="emit('stop-change-time')"
              @mouseup.prevent="emit('stop-change-time')"
              @keyup.enter.prevent="emit('stop-change-time')"
            >
              <slot name="down-arrow"></slot>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
