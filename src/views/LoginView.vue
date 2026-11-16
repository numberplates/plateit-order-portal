<template>
  <main class="portal-login portal-page centered-page">
    <section class="portal-card portal-login-card login-width">
      <div class="login-header">
        <CompanyLogo :config="companyConfig" />
        <h1 class="page-title">{{ companyConfig.loginTitle }}</h1>
        <p class="login-introduction">
          {{ companyConfig.loginIntroduction }}
        </p>
      </div>

      <div
        v-if="isMalformedLink || isExpired"
        class="login-notices"
        :class="{ 'login-notices-only': !showLoginForm }"
      >
        <AppAlert
          v-if="isMalformedLink && !isExpired"
          color="error"
          :description="companyConfig.loginMalformedLinkMessage"
        />
        <AppAlert v-if="isExpired" color="error" :description="expiryMessage" />
      </div>

      <form v-if="showLoginForm" class="login-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="order-id" class="field-label">{{ companyConfig.loginOrderNumberLabel }}</label>
          <input
            id="order-id"
            v-model.number="state.order_id"
            :disabled="disableOrderId"
            class="portal-input"
            type="number"
            min="1"
            placeholder="Enter your order ID"
            required
          />
        </div>

        <div class="form-field">
          <label for="email" class="field-label">{{ companyConfig.loginEmailLabel }}</label>
          <input
            id="email"
            v-model="state.email"
            :disabled="disableEmail"
            class="portal-input"
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
          class="portal-button portal-button-primary login-submit"
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
import { computed, reactive, ref } from 'vue'
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
const linkOnlyLogin = companyConfig.loginRequireConfirmationLink === true
const isMalformedLink = computed(() => linkOnlyLogin && !['order_id', 'email'].every(key =>
  typeof route.query[key] === 'string' && route.query[key].trim() !== ''
))
const isExpired = computed(() => route.query.expired === '1')
const showLoginForm = computed(() => !isMalformedLink.value && !(linkOnlyLogin && isExpired.value))
const expiryMessage = companyConfig.loginExpiryMessage ?? (linkOnlyLogin
  ? 'Access to this page has expired. Please close this page and re-follow your confirmation link to continue.'
  : 'Access to this page has expired. Please re-enter your order details or re-follow your confirmation link to continue.')
const disableOrderId = companyConfig.loginRequireConfirmationLink === true
  && typeof route.query.order_id === 'string'
  && route.query.order_id.trim() !== ''
const disableEmail = companyConfig.loginRequireConfirmationLink === true
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
const errorMessage = ref(null)

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
  if (isMalformedLink.value || (linkOnlyLogin && isExpired.value)) return

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
