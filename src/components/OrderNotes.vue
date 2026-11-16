<template>
  <section
    v-if="publicNotes.length"
    class="order-notes"
  >
    <div class="card-header">
      <h2 class="section-title">Notes</h2>
    </div>

    <div class="card-body notes-list">
      <article
        v-for="note in publicNotes"
        :key="note.id"
        class="order-note"
      >
        <div class="note-bubble">
          <p class="note-text">
            {{ note.note }}
          </p>
        </div>

        <div class="note-meta">
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
