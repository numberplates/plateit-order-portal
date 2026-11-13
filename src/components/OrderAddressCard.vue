<template>
  <section class="rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="border-b border-zinc-200 px-5 py-4">
      <h2 class="font-semibold text-zinc-950">
        {{ title }}
      </h2>
    </div>

    <div class="space-y-3 px-5 py-4 text-sm text-zinc-700">
      <strong
        v-if="name"
        class="block text-zinc-950"
      >
        {{ name }}
      </strong>

      <div v-if="addressLines.length">
        <div
          v-for="line in addressLines"
          :key="line"
        >
          {{ line }}
        </div>
      </div>

      <div
        v-if="email"
        class="text-zinc-500"
      >
        {{ email }}
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  resource: {
    type: Object,
    default: null
  }
})

const addressResource = computed(() => {
  return props.resource?.address ?? props.resource ?? {}
})

const name = computed(() => {
  const resource = props.resource ?? {}

  return [
    resource.first_name,
    resource.last_name
  ].filter(Boolean).join(' ') ||
    resource.company_name ||
    resource.name ||
    null
})

const email = computed(() => {
  return (
    props.resource?.email ??
    addressResource.value?.email ??
    null
  )
})

const addressLines = computed(() => {
  const resource = addressResource.value

  return [
    resource.company_name ?? resource.company,
    resource.address_line_1,
    resource.address_line_2,
    resource.address_line_3,
    resource.address_line_4,
    resource.address_postcode,
    resource.address_country_code,
  ].filter(Boolean)
})
</script>
