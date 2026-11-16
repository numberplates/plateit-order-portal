<template>
  <section class="order-package portal-card">
    <div class="card-header card-header-split">
      <div>
        <div class="title-group">
          <h2 class="section-title">
            Package {{ index + 1 }} of {{ total }}
          </h2>

          <span class="status-badge badge-neutral">
            {{ packageItem.system_package_status?.name ?? 'Unknown' }}
          </span>
        </div>

        <div class="supporting-text">
          Package #{{ packageItem.id }}
        </div>
      </div>

      <div
        v-if="packageItem.shipping"
        class="package-shipping"
      >
        <strong class="party-name">
          <span class="shipping-name">{{ packageItem.shipping.name }}</span>
          {{ ' ' }}<span class="shipping-price order-price">{{ formatPrice(packageItem.shipping.price) }}</span>
        </strong>

        <div
          v-if="packageItem.shipping.tracking_code"
          class="shipping-tracking muted"
        >
          Tracking:
          <a
            :href="getTrackingCodeUrl(packageItem.shipping.tracking_code)"
            target="_blank"
            rel="noopener"
            class="tracking-link"
          >
            {{ packageItem.shipping.tracking_code }}
          </a>
        </div>

        <div
          v-if="packageItem.shipping.despatched_at"
          class="shipping-despatched muted"
        >
          Despatched {{ formatDateString(packageItem.shipping.despatched_at) }}
        </div>
      </div>
    </div>

    <div class="card-body package-content">
      <div v-if="packageItem.plates?.length" class="package-plates">
        <h3 class="package-heading">Number Plates</h3>

        <div class="table-scroll">
          <table class="plates-table portal-table">
            <thead>
              <tr>
                <th class="plate-registration">Registration</th>
                <th class="plate-type">Type</th>
                <th class="plate-size">Size</th>
                <th class="plate-price order-price">Price</th>
                <th class="plate-quantity">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plate in packageItem.plates" :key="plate.id">
                <td class="plate-registration">
                  <button
                    type="button"
                    class="plate-preview-button"
                    title="Preview plate"
                    @click="openPlatePreview(plate)"
                  >
                    {{ plate.registration }}
                  </button>
                </td>
                <td class="plate-type">{{ plate.type ?? plate.name ?? '—' }}</td>
                <td class="plate-size">{{ getPlateSize(plate) }}</td>
                <td class="plate-price order-price">{{ formatPrice(plate.price) }}</td>
                <td class="plate-quantity">{{ plate.quantity ?? 1 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="packageItem.products?.length" class="package-products">
        <h3 class="package-heading">Products</h3>

        <div class="table-scroll">
          <table class="products-table portal-table">
            <thead>
              <tr>
                <th class="product-name">Product</th>
                <th class="product-price order-price">Price</th>
                <th class="product-quantity">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in packageItem.products" :key="product.id">
                <td class="product-name">{{ product.name ?? product.product?.name ?? `Product #${product.id}` }}</td>
                <td class="product-price order-price">{{ formatPrice(product.price) }}</td>
                <td class="product-quantity">{{ product.quantity ?? 1 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <OrderNotes class="package-notes" :notes="packageItem.notes ?? []" />
    </div>
  </section>

  <PlatePreviewModal
    :open="isPreviewOpen"
    :plate="selectedPlate"
    :plates="packageItem.plates ?? []"
    @close="closePlatePreview"
    @select="selectedPlate = $event"
  />
</template>

<script setup>
import { ref } from 'vue'
import { formatDateString, formatPrice } from '../utils/formatters'
import OrderNotes from './OrderNotes.vue'
import PlatePreviewModal from './PlatePreviewModal.vue'

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

const isPreviewOpen = ref(false)
const selectedPlate = ref(null)

/**
 * Opens the plate preview modal for the selected plate.
 *
 * @param {object} plate
 * @returns {void}
 */
function openPlatePreview(plate) {
  selectedPlate.value = plate
  isPreviewOpen.value = true
}

/**
 * Closes the plate preview modal.
 *
 * @returns {void}
 */
function closePlatePreview() {
  isPreviewOpen.value = false
  selectedPlate.value = null
}

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
