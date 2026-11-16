<template>
  <div
    class="portal-alert"
    :class="alertClass"
    role="alert"
  >
    {{ description }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'error'
  },
  description: {
    type: String,
    required: true
  }
})

const alertClass = computed(() => {
  const classes = {
    error: 'alert-error',
    warning: 'alert-warning',
    success: 'alert-success',
    neutral: 'alert-neutral'
  }

  return classes[props.color] ?? classes.neutral
})
</script>
