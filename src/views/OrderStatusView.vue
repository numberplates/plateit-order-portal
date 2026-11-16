<template>
  <main class="portal-order portal-page min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">
    <div class="mx-auto w-full max-w-5xl px-4 print:max-w-none print:px-0">
      <div
        v-if="isInitialLoading"
        class="grid min-h-60 place-items-center"
      >
        <div class="size-6 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900"></div>
      </div>

      <AppAlert
        v-else-if="errorMessage && !order"
        color="error"
        :description="errorMessage"
      />

      <div
        v-else-if="order"
        class="space-y-8"
      >
        <header class="order-header">
          <CompanyLogo :config="companyConfig" />
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="order-number text-2xl font-semibold text-zinc-950">
                  Order #{{ order.identifier ?? order.id }}
                </h1>

                <span
                  class="order-status inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="fulfilmentBadgeClass"
                  :title="order.system_order_fulfilment_status?.description"
                >
                  {{ order.system_order_fulfilment_status?.name ?? 'Unknown' }}
                </span>
              </div>

              <p class="order-date mt-3 text-sm text-zinc-500">
                Date {{ formatDateString(orderDate, false) }}
              </p>
            </div>

            <button
              type="button"
              class="portal-button portal-button-secondary inline-flex items-center justify-center gap-2 print-hidden rounded-lg border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
              @click="handlePrint"
            >
              <ButtonIcon name="printer" />
              Print
            </button>
          </div>
        </header>

        <AppAlert
          v-if="isExpiringSoon"
          color="warning"
          description="For security, access to this page will need to be renewed soon. If you are uploading documents, please complete them shortly."
          class="print-hidden"
        />

        <AppAlert
          v-if="errorMessage"
          color="error"
          :description="errorMessage"
        />

        <div class="order-parties grid gap-8 md:grid-cols-2">
          <OrderPartyCompanyCard
            :company="order.company"
          />

          <OrderPartyCustomerCard
            :customer="order.customer"
            :ship-to="order.ship_to"
          />
        </div>

        <div class="order-documents-section print-hidden">
          <OrderDocuments
            :order="order"
            :refreshing="isRefreshing"
            @saved="fetchOrder"
            @unauthorized="handleUnauthorized"
          />
        </div>

        <OrderPackage
          v-for="(packageItem, index) in order.packages ?? []"
          :key="packageItem.id"
          :package-item="packageItem"
          :index="index"
          :total="order.packages?.length ?? 0"
        />

        <div class="order-totals-section grid gap-8 md:grid-cols-2">
          <OrderTotals :order="order" />
        </div>

        <OrderNotes
          v-if="order.notes?.length"
          class="order-notes-section"
          :notes="order.notes"
        />

        <div class="order-actions print-hidden flex justify-end border-t border-zinc-200 pt-6">
          <button
            type="button"
            class="portal-button portal-button-secondary inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50"
            @click="handleExit"
          >
            <ButtonIcon name="exit" />
            Exit
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import ButtonIcon from '../components/ButtonIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppAlert from '../components/AppAlert.vue'
import CompanyLogo from '../components/CompanyLogo.vue'
import { getCompanyConfig } from '../config/companies'
import OrderPartyCompanyCard from '../components/OrderPartyCompanyCard.vue'
import OrderPartyCustomerCard from '../components/OrderPartyCustomerCard.vue'
import OrderDocuments from '../components/OrderDocuments.vue'
import OrderNotes from '../components/OrderNotes.vue'
import OrderPackage from '../components/OrderPackage.vue'
import OrderTotals from '../components/OrderTotals.vue'
import { apiFetch } from '../utils/apiFetch'
import { formatDateString } from '../utils/formatters'
import { resolveMessage } from '../utils/resolveMessage'
import { scopedAuth } from '../stores/scopedAuth'

const route = useRoute()
const router = useRouter()

const companyId = Number(route.params.companyId)
const companyConfig = getCompanyConfig(companyId)
const routeOrderId = String(route.params.id)

const order = ref(null)
const isInitialLoading = ref(true)
const isRefreshing = ref(false)
const errorMessage = ref(null)
const now = ref(Date.now())

let expiryTimer = null

const orderDate = computed(() => {
  return order.value?.paid_at ?? order.value?.opened_at ?? order.value?.created_at
})

const fulfilmentBadgeClass = computed(() => {
  const classes = {
    1: 'bg-zinc-100 text-zinc-600',
    2: 'bg-amber-100 text-amber-800',
    3: 'bg-green-100 text-green-800'
  }

  return classes[
    order.value?.system_order_fulfilment_status?.id
  ] ?? classes[1]
})

const isExpiringSoon = computed(() => {
  if (!scopedAuth.expiresAt.value) {
    return false
  }

  const remaining = new Date(scopedAuth.expiresAt.value).getTime() - now.value

  return remaining > 0 && remaining <= 2 * 60 * 1000
})

watchEffect(() => {
  document.title = order.value
    ? `Order Status #${order.value.identifier ?? order.value.id}`
    : 'Order Status'
})

onMounted(async () => {
  if (!Number.isInteger(companyId) || companyId <= 0) {
    await router.replace('/')
    return
  }

  scopedAuth.restoreAuth()

  if (
    !scopedAuth.isAuthenticated.value ||
    String(scopedAuth.orderId.value) !== routeOrderId
  ) {
    await redirectToLogin()
    return
  }

  now.value = Date.now()
  expiryTimer = window.setInterval(() => {
    now.value = Date.now()
  }, 30_000)

  await fetchOrder(true)
})

onBeforeUnmount(() => {
  if (expiryTimer) {
    window.clearInterval(expiryTimer)
  }
})

/**
 * Fetches the order available to the current scoped authentication token.
 *
 * @param {boolean} [initial=false]
 * @returns {Promise<void>}
 */
async function fetchOrder(initial = false) {
  try {
    initial
      ? isInitialLoading.value = true
      : isRefreshing.value = true

    errorMessage.value = null

    order.value = await apiFetch(`/v3/orders/${route.params.id}`, {
      query: {
        with: [
          'company',
          'customer',
          'ship_to',
          'system_order_fulfilment_status',
          'system_order_document_status',
          'packages.system_package_status',
          'packages.plates',
          'packages.products',
          'packages.shipping',
          'packages.notes.company_user',
          'packages.ship_to_override',
          'notes.company_user',
          'documents',
          'documents_missing'
        ]
      }
    })
  } catch (error) {
    if (error?.status === 401) {
      await handleUnauthorized()
      return
    }

    errorMessage.value = resolveMessage(error, 'The order could not be loaded.')
  } finally {
    initial
      ? isInitialLoading.value = false
      : isRefreshing.value = false
  }
}

/**
 * Clears expired authentication and returns to the scoped login page.
 *
 * @returns {Promise<void>}
 */
async function handleUnauthorized() {
  scopedAuth.clearAuth()
  await redirectToLogin({ expired: '1' })
}

/**
 * Ends the current scoped session.
 *
 * @returns {Promise<void>}
 */
async function handleExit() {
  scopedAuth.clearAuth()
  await redirectToLogin()
}

/**
 * Redirects to the company-scoped login page.
 *
 * @param {object} [query={}]
 * @returns {Promise<void>}
 */
async function redirectToLogin(query = {}) {
  await router.replace({
    name: 'order-status-login',
    params: { companyId },
    query
  })
}

/**
 * Opens the browser print dialog.
 *
 * @returns {void}
 */
function handlePrint() {
  window.print()
}
</script>
