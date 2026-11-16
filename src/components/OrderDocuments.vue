<template>
  <section class="order-documents portal-card">
    <div class="card-header card-header-split">
      <div>
        <h2 class="section-title">Documents</h2>
        <div class="supporting-text">
          {{ order.system_order_document_status?.description }}
        </div>
      </div>

      <div class="status-group">
        <div
          v-if="refreshing"
          class="loading-spinner loading-spinner-small"
        ></div>

        <span
          class="status-badge"
          :class="badgeClass"
        >
          {{ order.system_order_document_status?.name ?? 'Unknown' }}
        </span>
      </div>
    </div>

    <div class="card-body">
      <div v-if="tableRows.length" class="table-scroll">
        <table class="documents-table portal-table">
          <thead>
            <tr>
              <th class="document-action">Action</th>
              <th class="document-type">Type</th>
              <th class="document-reference">Reference</th>
              <th class="document-status">Status</th>
              <th
                v-if="hasRejectedDocuments"
                class="document-reason"
              >
                Reason
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in tableRows" :key="row.id">
              <td class="document-action">
                <button
                  v-if="row.isMissing || row.status === 'rejected'"
                  type="button"
                  class="portal-button portal-button-primary"
                  :disabled="refreshing"
                  @click="openUpload(row.resource)"
                >
                  <ButtonIcon name="upload" />
                  {{ row.isMissing ? 'Upload' : 'Replace' }}
                </button>
                <span v-else class="muted">—</span>
              </td>

              <td class="document-type">
                <strong>{{ formatDocumentType(row.resource.type) }}</strong>
              </td>

              <td class="document-reference muted">
                {{ getDocumentReference(row.resource) }}
              </td>

              <td class="document-status">
                <span
                  class="status-badge"
                  :class="getStatusBadge(row.status).className"
                >
                  {{ getStatusBadge(row.status).label }}
                </span>
              </td>

              <td
                v-if="hasRejectedDocuments"
                class="document-reason"
              >
                <span
                  v-if="row.status === 'rejected'"
                  class="rejection-reason"
                >
                  {{ formatRejectionReason(row.resource.rejection_reason) }}
                </span>
                <span v-else class="muted">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="muted">
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
import ButtonIcon from './ButtonIcon.vue'
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
    1: 'badge-neutral',
    2: 'badge-error',
    3: 'badge-warning',
    4: 'badge-success'
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
