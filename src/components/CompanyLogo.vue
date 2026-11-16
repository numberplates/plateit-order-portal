<template>
  <img
    v-if="config.logoUrl && !failed"
    :src="config.logoUrl"
    :alt="config.logoAlt"
    class="company-logo"
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
