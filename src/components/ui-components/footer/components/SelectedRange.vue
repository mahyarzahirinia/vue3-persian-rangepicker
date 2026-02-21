<script setup lang="ts">
  defineProps<{
    startText: string | null;
    endText: string | null;
  }>();
</script>

<template>
  <div>
    <slot name="footer"></slot>
    <small v-if="startText">{{ startText }}</small>
    <small v-if="endText"> - {{ endText }} </small>
  </div>
</template>
