<script setup lang="ts">
  import type { MonthDays, PersianDate } from '../../../types';

  defineProps<{
    columnCount: number;
    langWeekdays: string[];
    monthDays: MonthDays[][][];
  }>();

  const emit = defineEmits<{
    (e: 'select-date', date: PersianDate, part: 'date'): void;
  }>();
</script>

<template>
  <div class="pdp-date">
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
</template>
