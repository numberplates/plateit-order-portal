<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4 shrink-0"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="paths[name]" />
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })

const paths = {
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  'rotate-left': 'M3 4v6h6M3 10a9 9 0 1 1 1 8',
  'rotate-right': 'M21 4v6h-6m6 0a9 9 0 1 0-1 8',
  reset: 'M3 3v6h6M3 9a9 9 0 1 1 0 6m9-8v5l3 2',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  printer: 'M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6zm11-2h1',
  close: 'm6 6 12 12M6 18 18 6',
  exit: 'M9 3H4v18h5m0-9h12m-5-5 5 5-5 5'
}
</script>
