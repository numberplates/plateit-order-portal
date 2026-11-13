<template>
  <section
    v-if="publicNotes.length"
    class="rounded-xl border border-zinc-200 bg-white shadow-sm"
  >
    <div class="border-b border-zinc-200 px-5 py-4">
      <h2 class="font-semibold text-zinc-950">Notes</h2>
    </div>

    <div class="space-y-4 px-5 py-4">
      <article
        v-for="note in publicNotes"
        :key="note.id"
        class="space-y-2 text-center"
      >
        <div class="relative rounded-md bg-zinc-100 px-4 py-3 after:absolute after:-bottom-1.5 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rotate-45 after:bg-zinc-100">
          <p class="relative z-10 whitespace-pre-wrap break-words text-sm text-zinc-800">
            {{ note.note }}
          </p>
        </div>

        <div class="text-xs text-zinc-500">
          {{ getAuthorName(note) }} · {{ formatDateString(note.created_at) }}
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateString } from '../utils/formatters'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  }
})

const publicNotes = computed(() => {
  return props.notes.filter(note => {
    return note.is_private !== true
  })
})

/**
 * Returns the author name for a note.
 *
 * @param {object} note
 * @returns {string}
 */
function getAuthorName(note) {
  const name = [
    note.company_user?.first_name,
    note.company_user?.last_name
  ].filter(Boolean).join(' ')

  return name || 'Customer Service'
}
</script>
