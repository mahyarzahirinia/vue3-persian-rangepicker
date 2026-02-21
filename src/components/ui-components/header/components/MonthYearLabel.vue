<script setup lang="ts">
  defineProps<{
    monthLabel: string;
    year: number;
  }>();

  const emit = defineEmits<{
    (e: 'show-part', part: 'month' | 'year'): void;
  }>();
</script>

<template>
  <div>
    <button
      class="pdp-month"
      type="button"
      tabindex="-1"
      @click="emit('show-part', 'month')"
    >
      {{ monthLabel }}
    </button>

    <button
      class="pdp-year"
      type="button"
      tabindex="-1"
      @click="emit('show-part', 'year')"
    >
      {{ year }}
    </button>
  </div>
</template>
