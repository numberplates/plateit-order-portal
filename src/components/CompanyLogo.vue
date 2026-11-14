<template>
  <img
    v-if="config.logoUrl && !failed"
    :src="config.logoUrl"
    :alt="config.logoAlt"
    class="mb-5 h-14 max-w-full object-contain object-left"
    @error="failed = true"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  config: { type: Object, required: true }
})
const failed = ref(false)
watch(() => props.config.logoUrl, () => { failed.value = false })
</script>
