<template>
  <section class="rounded-xl border border-zinc-200 bg-white shadow-sm">
    <div class="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-semibold text-zinc-950">Documents</h2>
        <div class="mt-1 text-sm text-zinc-500">
          {{ order.system_order_document_status?.description }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div
          v-if="refreshing"
          class="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900"
        ></div>

        <span
          class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="badgeClass"
        >
          {{ order.system_order_document_status?.name ?? 'Unknown' }}
        </span>
      </div>
    </div>

    <div class="px-5 py-4">
      <div v-if="tableRows.length" class="overflow-x-auto">
        <table class="min-w-[680px] w-full border-collapse text-sm">
          <thead>
            <tr class="text-left text-zinc-500">
              <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Action</th>
              <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Type</th>
              <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Reference</th>
              <th class="border-b border-zinc-200 px-2.5 py-3 font-semibold">Status</th>
              <th
                v-if="hasRejectedDocuments"
                class="border-b border-zinc-200 px-2.5 py-3 font-semibold"
              >
                Reason
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in tableRows" :key="row.id">
              <td class="border-b border-zinc-200 px-2.5 py-3">
                <button
                  v-if="row.isMissing || row.status === 'rejected'"
                  type="button"
                  class="rounded-lg bg-zinc-900 px-3 py-2 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="refreshing"
                  @click="openUpload(row.resource)"
                >
                  {{ row.isMissing ? 'Upload' : 'Replace' }}
                </button>
                <span v-else class="text-zinc-400">—</span>
              </td>

              <td class="border-b border-zinc-200 px-2.5 py-3">
                <strong>{{ formatDocumentType(row.resource.type) }}</strong>
              </td>

              <td class="border-b border-zinc-200 px-2.5 py-3 text-zinc-500">
                {{ getDocumentReference(row.resource) }}
              </td>

              <td class="border-b border-zinc-200 px-2.5 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="getStatusBadge(row.status).className"
                >
                  {{ getStatusBadge(row.status).label }}
                </span>
              </td>

              <td
                v-if="hasRejectedDocuments"
                class="border-b border-zinc-200 px-2.5 py-3"
              >
                <span
                  v-if="row.status === 'rejected'"
                  class="text-red-700"
                >
                  {{ formatRejectionReason(row.resource.rejection_reason) }}
                </span>
                <span v-else class="text-zinc-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="text-sm text-zinc-500">
        No documents.
      </div>
    </div>
  </section>

  <DocumentUploadModal
    :open="isUploadOpen"
    :order-id="order.id"
    :requirement="uploadRequirement"
    :document="replacementDocument"
    @close="isUploadOpen = false"
    @saved="handleSaved"
    @unauthorized="emit('unauthorized')"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import DocumentUploadModal from './DocumentUploadModal.vue'
import { useOrderDocuments } from '../composables/useOrderDocuments'
import { snakeCaseToTitleCase } from '../utils/formatters'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  refreshing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'saved',
  'unauthorized'
])

const isUploadOpen = ref(false)
const uploadResource = ref(null)

const documents = computed(() => {
  return props.order.documents ?? []
})

const documentRequirements = computed(() => {
  return props.order.documents_missing ?? []
})

const {
  tableRows,
  getStatusBadge,
  formatDocumentType,
  getDocumentReference,
  getUploadRequirement,
  getReplacementDocument
} = useOrderDocuments(
  documents,
  documentRequirements
)

const hasRejectedDocuments = computed(() => {
  return documents.value.some((document) => {
    return document.status === 'rejected'
  })
})

const badgeClass = computed(() => {
  const classes = {
    1: 'bg-zinc-100 text-zinc-600',
    2: 'bg-red-100 text-red-800',
    3: 'bg-amber-100 text-amber-800',
    4: 'bg-green-100 text-green-800'
  }

  return classes[
    props.order.system_order_document_status?.id
  ] ?? classes[1]
})

const uploadRequirement = computed(() => {
  return getUploadRequirement(
    uploadResource.value
  )
})

const replacementDocument = computed(() => {
  return getReplacementDocument(
    uploadResource.value
  )
})

/**
 * Opens the upload modal for a missing or rejected document.
 *
 * @param {object} document
 * @returns {void}
 */
function openUpload(document) {
  uploadResource.value = document
  isUploadOpen.value = true
}

/**
 * Handles a successful upload and asks the parent to refresh the order.
 *
 * @param {object} document
 * @returns {void}
 */
function handleSaved(document) {
  isUploadOpen.value = false
  uploadResource.value = null

  emit('saved', document)
}

/**
 * Formats a rejection reason for display.
 *
 * @param {string|null|undefined} reason
 * @returns {string}
 */
function formatRejectionReason(reason) {
  return reason
    ? snakeCaseToTitleCase(reason)
    : '—'
}
</script>
