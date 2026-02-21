<script setup lang="ts">
  defineProps<{
    unit: 'hour' | 'minute';
    timeIndex: number;
    displayValue: string;
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
</script>

<template>
  <div :class="unit">
    <button
      type="button"
      @touchstart.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'add' })
      "
      @mousedown.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'add' })
      "
      @keydown.enter.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'add' })
      "
      @touchend.prevent="emit('stop-change-time')"
      @mouseup.prevent="emit('stop-change-time')"
      @keyup.enter.prevent="emit('stop-change-time')"
    >
      <slot name="up-arrow"></slot>
    </button>

    {{ displayValue }}

    <button
      type="button"
      @touchstart.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'sub' })
      "
      @mousedown.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'sub' })
      "
      @keydown.enter.prevent="
        emit('start-change-time', { timeIndex, unit, operator: 'sub' })
      "
      @touchend.prevent="emit('stop-change-time')"
      @mouseup.prevent="emit('stop-change-time')"
      @keyup.enter.prevent="emit('stop-change-time')"
    >
      <slot name="down-arrow"></slot>
    </button>
  </div>
</template>
