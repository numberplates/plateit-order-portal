<template>
  <div
    class="rounded-lg border px-4 py-3 text-sm"
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
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    neutral: 'border-zinc-200 bg-zinc-50 text-zinc-700'
  }

  return classes[props.color] ?? classes.neutral
})
</script>
