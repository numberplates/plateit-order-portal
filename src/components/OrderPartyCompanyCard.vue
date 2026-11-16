<template>
  <section class="order-company portal-card">
    <div class="card-header">
      <h2 class="section-title">Company</h2>
    </div>

    <div class="card-body party-details">
      <strong v-if="company?.name" class="party-name">{{ company.name }}</strong>

      <div v-if="addressLines.length">
        <div v-for="(line, index) in addressLines" :key="index">{{ line }}</div>
      </div>

      <div v-if="company?.email" class="muted">{{ company.email }}</div>
      <div v-if="company?.phone_number" class="muted">
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
