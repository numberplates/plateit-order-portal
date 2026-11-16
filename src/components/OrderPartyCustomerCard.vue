<template>
  <section class="order-customer portal-card">
    <div class="card-header">
      <h2 class="section-title">Customer</h2>
    </div>

    <div class="card-body party-details">
      <strong v-if="customerName" class="party-name">{{ customerName }}</strong>

      <div v-if="shipToName || addressLines.length">
        <div v-if="shipToName">{{ shipToName }}</div>
        <div v-for="(line, index) in addressLines" :key="index">{{ line }}</div>
      </div>

      <div v-if="customer?.email" class="muted">{{ customer.email }}</div>
      <div v-if="customer?.phone_number" class="muted">
        Phone: {{ customer.phone_number }}
      </div>
      <div v-if="customer?.mobile_number" class="muted">
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
