<template>
  <section class="portal-card rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="border-b border-zinc-200 px-5 py-4">
      <h2 class="font-semibold text-zinc-950">Totals</h2>
    </div>

    <div class="space-y-2.5 px-5 py-4">
      <div
        v-for="item in items"
        :key="item.label"
        class="flex justify-between gap-5 text-sm"
      >
        <span class="text-zinc-500">{{ item.label }}</span>
        <strong class="text-right text-zinc-950">{{ item.value }}</strong>
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
