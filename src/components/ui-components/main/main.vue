<script setup lang="ts">
  import type { MonthDays, Mode, PickerType, PersianDate } from '../../types';
  import DateGrid from './components/DateGrid.vue';
  import TimePicker from './components/TimePicker.vue';

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
    <DateGrid
      v-if="type.includes('date')"
      :column-count="columnCount"
      :lang-weekdays="langWeekdays"
      :month-days="monthDays"
      @select-date="(date, part) => emit('select-date', date, part)"
    />

    <TimePicker
      v-if="type.includes('time')"
      :type="type"
      :mode="mode"
      :column-count="columnCount"
      :selected-times="selectedTimes"
      :core="core"
      :time-disabled="timeDisabled"
      @start-change-time="emit('start-change-time', $event)"
      @stop-change-time="emit('stop-change-time')"
    >
      <template #up-arrow><slot name="up-arrow"></slot></template>
      <template #down-arrow><slot name="down-arrow"></slot></template>
    </TimePicker>
  </div>
</template>
