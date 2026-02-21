<script setup lang="ts">
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
    <div>
      <slot name="footer"></slot>
      <small v-if="startText">
        {{ startText }}
      </small>
      <small v-if="endText"> - {{ endText }} </small>
    </div>

    <div>
      <button
        v-if="canGoToday"
        class="pdp-today"
        type="button"
        :tabindex="tabIndex"
        @click="emit('go-today')"
      >
        {{ nowLabel }}
      </button>

      <button
        v-if="canSubmit"
        class="pdp-submit"
        type="button"
        :tabindex="tabIndex"
        @click="emit('submit')"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>
