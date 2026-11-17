<template>
  <main class="portal-home portal-page centered-page">
    <section class="portal-home-card portal-card login-width">
      <div class="card-body notice-content">
        <CompanyLogo :config="config" />
        <h1 class="page-title">{{ config.homeTitle }}</h1>
        <p class="muted">{{ config.homeMessage }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import CompanyLogo from '../components/CompanyLogo.vue'
import { getCompanyConfig } from '../config/companies'

// The root page has no company scope, so it uses app and shared defaults only.
const config = getCompanyConfig()
</script>
