<script setup lang="ts">
  import SelectedRange from './components/SelectedRange.vue';
  import FooterActions from './components/FooterActions.vue';

  defineProps<{
    startText: string | null;
    endText: string | null;
    tabIndex?: number;
    canGoToday: boolean;
    canSubmit: boolean;
    nowLabel: string;
    submitLabel: string;
  }>();

  const emit = defineEmits<{
    (e: 'go-today'): void;
    (e: 'submit'): void;
  }>();
</script>

<template>
  <div class="pdp-footer">
    <SelectedRange :start-text="startText" :end-text="endText">
      <template #footer><slot name="footer"></slot></template>
    </SelectedRange>

    <FooterActions
      :tab-index="tabIndex"
      :can-go-today="canGoToday"
      :can-submit="canSubmit"
      :now-label="nowLabel"
      :submit-label="submitLabel"
      @go-today="emit('go-today')"
      @submit="emit('submit')"
    />
  </div>
</template>
