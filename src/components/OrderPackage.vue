<template>
  <section class="rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="font-semibold text-zinc-950">
            Package {{ index + 1 }} of {{ total }}
          </h2>

          <span class="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
            {{ packageItem.system_package_status?.name ?? 'Unknown' }}
          </span>
        </div>

        <div class="mt-1 text-sm text-zinc-500">
          Package #{{ packageItem.id }}
        </div>
      </div>

      <div
        v-if="packageItem.shipping"
        class="text-sm sm:text-right"
      >
        <strong class="text-zinc-950">
          {{ packageItem.shipping.name }}
          {{ formatPrice(packageItem.shipping.price) }}
        </strong>

        <div
          v-if="packageItem.shipping.tracking_code"
          class="text-zinc-500"
        >
          Tracking:
          <a
            :href="getTrackingCodeUrl(packageItem.shipping.tracking_code)"
            target="_blank"
            rel="noopener"
            class="underline underline-offset-2"
          >
            {{ packageItem.shipping.tracking_code }}
          </a>
        </div>

        <div
          v-if="packageItem.shipping.despatched_at"
          class="text-zinc-500"
        >
          Despatched {{ formatDateString(packageItem.shipping.despatched_at) }}
        </div>
      </div>
    </div>

    <div class="space-y-6 px-5 py-4">
      <div v-if="packageItem.plates?.length">
        <h3 class="mb-2.5 font-semibold text-zinc-950">Number Plates</h3>

        <div class="overflow-x-auto">
          <table class="min-w-[620px] w-full border-collapse text-sm">
            <thead>
              <tr class="text-left text-zinc-500">
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Registration</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Type</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Size</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Price</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plate in packageItem.plates" :key="plate.id">
                <td class="border-b border-zinc-200 px-2.5 py-3"><strong>{{ plate.registration }}</strong></td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ plate.type ?? plate.name ?? '—' }}</td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ getPlateSize(plate) }}</td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ formatPrice(plate.price) }}</td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ plate.quantity ?? 1 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="packageItem.products?.length">
        <h3 class="mb-2.5 font-semibold text-zinc-950">Products</h3>

        <div class="overflow-x-auto">
          <table class="min-w-[520px] w-full border-collapse text-sm">
            <thead>
              <tr class="text-left text-zinc-500">
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Product</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Price</th>
                <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in packageItem.products" :key="product.id">
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ product.name ?? product.product?.name ?? `Product #${product.id}` }}</td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ formatPrice(product.price) }}</td>
                <td class="border-b border-zinc-200 px-2.5 py-3">{{ product.quantity ?? 1 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <OrderNotes :notes="packageItem.notes ?? []" />
    </div>
  </section>
</template>

<script setup>
import { formatDateString, formatPrice } from '../utils/formatters'
import OrderNotes from './OrderNotes.vue'

defineProps({
  packageItem: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

/**
 * Returns a readable plate size.
 *
 * @param {object} plate
 * @returns {string}
 */
function getPlateSize(plate) {
  if (plate.width == null || plate.height == null) {
    return 'N/A'
  }

  return `${plate.width}×${plate.height}mm`
}

/**
 * Returns a tracking URL for the given carrier code.
 *
 * @param {string} trackingCode
 * @returns {string}
 */
function getTrackingCodeUrl(trackingCode) {
  const code = trackingCode
    .toUpperCase()
    .replace(/\s+/g, '')

  if (/^[A-Z]{2}\d{9}GB$/.test(code)) {
    return `https://www.royalmail.com/portal/rm/track?trackNumber=${code}`
  }

  if (/^H.{15}$/.test(code)) {
    return `https://www.evri.com/track/parcel/${code}`
  }

  return `https://parcelsapp.com/en/tracking/${code}`
}
</script>
