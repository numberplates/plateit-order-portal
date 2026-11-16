<template>
  <section class="order-company portal-card rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="border-b border-zinc-200 px-5 py-4">
      <h2 class="font-semibold text-zinc-950">Company</h2>
    </div>

    <div class="space-y-3 px-5 py-4 text-sm text-zinc-700">
      <strong v-if="company?.name" class="text-zinc-950">{{ company.name }}</strong>

      <div v-if="addressLines.length">
        <div v-for="(line, index) in addressLines" :key="index">{{ line }}</div>
      </div>

      <div v-if="company?.email" class="text-zinc-500">{{ company.email }}</div>
      <div v-if="company?.phone_number" class="text-zinc-500">
        Phone: {{ company.phone_number }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  company: { type: Object, default: null }
})

const addressLines = computed(() => [
  props.company?.address_line_1,
  props.company?.address_line_2,
  props.company?.address_line_3,
  props.company?.address_postcode,
  props.company?.address_country_code
].filter(Boolean))
</script>
