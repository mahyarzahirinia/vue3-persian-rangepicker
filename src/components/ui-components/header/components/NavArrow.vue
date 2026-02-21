<script setup lang="ts">
  defineProps<{
    direction: 'prev' | 'next';
    disabled: boolean;
    title: string;
  }>();

  const emit = defineEmits<{
    (e: 'click'): void;
  }>();
</script>

<template>
  <button
    tabindex="-1"
    type="button"
    :class="['pdp-arrow', { disabled }]"
    :title="title"
    @click="emit('click')"
  >
    <slot></slot>
  </button>
</template>
