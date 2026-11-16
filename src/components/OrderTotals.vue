<template>
  <section class="order-totals portal-card">
    <div class="card-header">
      <h2 class="section-title">Totals</h2>
    </div>

    <div class="card-body totals-list">
      <div
        v-for="item in items"
        :key="item.label"
        class="total-row"
      >
        <span class="muted">{{ item.label }}</span>
        <strong class="total-value">{{ item.value }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatPrice } from '../utils/formatters'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const items = computed(() => {
  const items = [
    {
      label: 'Subtotal',
      value: formatPrice(props.order.amount_subtotal)
    },
    {
      label: 'Shipping',
      value: formatPrice(props.order.amount_shipping)
    },
    {
      label: 'Total',
      value: formatPrice(props.order.amount_total)
    },
    {
      label: 'Paid',
      value: formatPrice(props.order.amount_paid)
    }
  ]

  if (props.order.amount_refunded) {
    items.push({
      label: 'Refunded',
      value: formatPrice(props.order.amount_refunded)
    })
  }

  return items
})
</script>
