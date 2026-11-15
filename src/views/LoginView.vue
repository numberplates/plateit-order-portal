<template>
  <main class="portal-login portal-page grid min-h-screen place-items-center bg-zinc-100 px-4 py-8">
    <section class="portal-card portal-login-card w-full max-w-md rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div class="border-b border-zinc-200 px-6 py-5">
        <CompanyLogo :config="companyConfig" />
        <h1 class="text-2xl font-semibold text-zinc-950">{{ companyConfig.loginTitle }}</h1>
        <p class="mt-2 text-sm text-zinc-500">
          {{ companyConfig.loginIntroduction }}
        </p>
      </div>

      <form class="space-y-4 px-6 py-5" @submit.prevent="handleSubmit">
        <div class="space-y-1.5">
          <label for="order-id" class="text-sm font-semibold text-zinc-800">{{ companyConfig.loginOrderNumberLabel }}</label>
          <input
            id="order-id"
            v-model.number="state.order_id"
            :disabled="disableOrderId"
            class="portal-input w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            type="number"
            min="1"
            placeholder="Enter your order ID"
            required
          />
        </div>

        <div class="space-y-1.5">
          <label for="email" class="text-sm font-semibold text-zinc-800">{{ companyConfig.loginEmailLabel }}</label>
          <input
            id="email"
            v-model="state.email"
            :disabled="disableEmail"
            class="portal-input w-full rounded-lg border border-zinc-300 px-3 py-2.5 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <AppAlert
          v-if="errorMessage"
          color="error"
          :description="errorMessage"
        />

        <button
          type="submit"
          class="portal-button portal-button-primary inline-flex items-center justify-center gap-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
        >
          <ButtonIcon name="arrow-right" />
          {{ isLoading ? 'Accessing Order…' : companyConfig.loginButtonText }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import ButtonIcon from '../components/ButtonIcon.vue'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { z } from 'zod'
import AppAlert from '../components/AppAlert.vue'
import CompanyLogo from '../components/CompanyLogo.vue'
import { getCompanyConfig } from '../config/companies'
import { apiFetch } from '../utils/apiFetch'
import { resolveMessage } from '../utils/resolveMessage'
import { scopedAuth } from '../stores/scopedAuth'

const route = useRoute()
const router = useRouter()
const companyId = Number(route.params.companyId)
const companyConfig = getCompanyConfig(companyId)
const disableOrderId = companyConfig.loginDisablePrefilledFields === true
  && typeof route.query.order_id === 'string'
  && route.query.order_id.trim() !== ''
const disableEmail = companyConfig.loginDisablePrefilledFields === true
  && typeof route.query.email === 'string'
  && route.query.email.trim() !== ''

scopedAuth.clearAuth()

if (!Number.isInteger(companyId) || companyId <= 0) {
  router.replace('/')
}

const state = reactive({
  order_id: typeof route.query.order_id === 'string'
    ? Number(route.query.order_id)
    : null,
  email: typeof route.query.email === 'string'
    ? route.query.email
    : ''
})

const isLoading = ref(false)
const errorMessage = ref(
  route.query.expired === '1'
    ? 'Access to this page has expired. Please re-enter your order details to continue.'
    : null
)

const schema = z.object({
  order_id: z.number().int().positive(),
  email: z.email()
})

/**
 * Authenticates the customer and opens their scoped order.
 *
 * @returns {Promise<void>}
 */
async function handleSubmit() {
  errorMessage.value = null

  const result = schema.safeParse(state)

  if (!result.success) {
    errorMessage.value = 'Please enter a valid order number and email address.'
    return
  }

  try {
    isLoading.value = true

    const response = await apiFetch('/v3/auth/scoped', {
      method: 'POST',
      body: {
        ...result.data,
        company_id: companyId
      }
    })

    scopedAuth.setAuth(
      response.token,
      response.order_id,
      response.expires_at
    )

    await router.push({
      name: 'order-status-overview',
      params: {
        companyId,
        id: response.order_id
      }
    })
  } catch (error) {
    errorMessage.value = resolveMessage(
      error,
      'Unable to access the order. Please check the details and try again.'
    )
  } finally {
    isLoading.value = false
  }
}
</script>
