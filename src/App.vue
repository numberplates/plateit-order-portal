<template>
  <div class="portal" :data-company-id="route.params.companyId">
    <RouterView :key="$route.params.companyId" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { getCompanyConfig } from './config/companies'

const route = useRoute()
const favicon = document.getElementById('portal-favicon')
const originalFavicon = favicon?.getAttribute('href') ?? '/favicon.svg'
watchEffect(() => {
  if (favicon) {
    favicon.setAttribute('href', getCompanyConfig(route.params.companyId).faviconUrl || originalFavicon)
  }
})
onBeforeUnmount(() => favicon?.setAttribute('href', originalFavicon))

// Only the current company's CSS is installed, avoiding cross-company styles.
const stylesheets = import.meta.glob('../config/{defaults,companies/*}.css', {
  query: '?raw', import: 'default', eager: true
})
const customStyle = document.createElement('style')
customStyle.dataset.portalCompanyStyles = ''
document.head.append(customStyle)
watchEffect(() => {
  const companyId = String(route.params.companyId ?? '')
  customStyle.textContent = [
    stylesheets['../config/defaults.css'],
    stylesheets[`../config/companies/${companyId}.css`]
  ].filter(Boolean).join('\n')
})
onBeforeUnmount(() => customStyle.remove())
</script>
