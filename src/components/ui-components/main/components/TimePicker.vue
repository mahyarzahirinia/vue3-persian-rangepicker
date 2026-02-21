<script setup lang="ts">
  import type { Mode, PickerType, PersianDate } from '../../../types';
  import TimeSpinner from './TimeSpinner.vue';

  const props = defineProps<{
    type: PickerType;
    mode: Mode;
    columnCount: number;
    selectedTimes: PersianDate[];
    core: PersianDate;
    timeDisabled: boolean[];
  }>();

  const emit = defineEmits<{
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

  function hourDisplay(i: number): string {
    return props.selectedTimes[i]
      ? props.selectedTimes[i].hour('HH')
      : props.core.hour('HH');
  }

  function minuteDisplay(i: number): string {
    return props.selectedTimes[i]
      ? props.selectedTimes[i].minute('mm')
      : props.core.minute('mm');
  }
</script>

<template>
  <div class="pdp-time inline">
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
        <TimeSpinner
          unit="hour"
          :time-index="i"
          :display-value="hourDisplay(i)"
          @start-change-time="emit('start-change-time', $event)"
          @stop-change-time="emit('stop-change-time')"
        >
          <template #up-arrow><slot name="up-arrow"></slot></template>
          <template #down-arrow><slot name="down-arrow"></slot></template>
        </TimeSpinner>

        :

        <TimeSpinner
          unit="minute"
          :time-index="i"
          :display-value="minuteDisplay(i)"
          @start-change-time="emit('start-change-time', $event)"
          @stop-change-time="emit('stop-change-time')"
        >
          <template #up-arrow><slot name="up-arrow"></slot></template>
          <template #down-arrow><slot name="down-arrow"></slot></template>
        </TimeSpinner>
      </div>
    </div>
  </div>
</template>
