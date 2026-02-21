<script setup lang="ts">
  defineProps<{
    text: string;
    nextLocale: string;
    tabIndex?: number;
  }>();

  const emit = defineEmits<{
    (e: 'change-locale'): void;
  }>();
</script>

<template>
  <div class="top">
    <div>{{ text }}</div>
    <button type="button" :tabindex="tabIndex" @click="emit('change-locale')">
      {{ nextLocale }}
    </button>
  </div>
</template>
