<template>
  <section class="order-customer portal-card rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="border-b border-zinc-200 px-5 py-4">
      <h2 class="font-semibold text-zinc-950">Customer</h2>
    </div>

    <div class="space-y-3 px-5 py-4 text-sm text-zinc-700">
      <strong v-if="customerName" class="text-zinc-950">{{ customerName }}</strong>

      <div v-if="shipToName || addressLines.length">
        <div v-if="shipToName">{{ shipToName }}</div>
        <div v-for="(line, index) in addressLines" :key="index">{{ line }}</div>
      </div>

      <div v-if="customer?.email" class="text-zinc-500">{{ customer.email }}</div>
      <div v-if="customer?.phone_number" class="text-zinc-500">
        Phone: {{ customer.phone_number }}
      </div>
      <div v-if="customer?.mobile_number" class="text-zinc-500">
        Mobile: {{ customer.mobile_number }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  customer: { type: Object, default: null },
  shipTo: { type: Object, default: null }
})

const customerName = computed(() => [props.customer?.first_name, props.customer?.last_name].filter(Boolean).join(' '))
const shipToName = computed(() => [props.shipTo?.first_name, props.shipTo?.last_name].filter(Boolean).join(' '))
const addressLines = computed(() => [
  props.shipTo?.address_line_1,
  props.shipTo?.address_line_2,
  props.shipTo?.address_line_3,
  props.shipTo?.address_postcode,
  props.shipTo?.address_country_code
].filter(Boolean))
</script>
