<script setup lang="ts">
  import type { Langs, PickerType } from '../../types';

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
    <div v-if="locale.includes(',')" class="top">
      <div>{{ lang.translations.text }}</div>
      <button type="button" :tabindex="tabIndex" @click="emit('change-locale')">
        {{ nextLocale }}
      </button>
    </div>

    <div class="bottom">
      <button
        tabindex="-1"
        type="button"
        :class="['pdp-arrow', { disabled: !canGoPrevMonth }]"
        :title="lang.translations.prevMonth"
        @click="emit('change-month', 'sub')"
      >
        <slot name="right-arrow"></slot>
      </button>

      <div>
        <div v-for="(column, i) in columns" :key="i">
          <button
            class="pdp-month"
            type="button"
            tabindex="-1"
            @click="emit('show-part', 'month')"
          >
            {{ column.monthLabel }}
          </button>

          <button
            class="pdp-year"
            type="button"
            tabindex="-1"
            @click="emit('show-part', 'year')"
          >
            {{ column.year }}
          </button>
        </div>
      </div>

      <button
        tabindex="-1"
        type="button"
        :class="['pdp-arrow', { disabled: !canGoNextMonth }]"
        :title="lang.translations.nextMonth"
        @click="emit('change-month', 'add')"
      >
        <slot name="left-arrow"></slot>
      </button>
    </div>
  </div>
</template>
