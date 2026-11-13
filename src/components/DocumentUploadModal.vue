<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5"
    @click.self="emit('close')"
  >
    <section class="max-h-[calc(100vh-40px)] w-full max-w-2xl overflow-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
      <div class="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2 class="font-semibold text-zinc-950">{{ title }}</h2>
          <p class="mt-1 text-sm text-zinc-500">{{ description }}</p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <form class="space-y-5 px-5 py-4" @submit.prevent="handleSubmit">
        <div
          v-if="requirement?.registration"
          class="text-sm text-zinc-700"
        >
          <strong>Registration:</strong>
          {{ requirement.registration }}
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-zinc-800">File</label>

          <DocumentImageEditor
            ref="imageEditor"
            v-model:file="selectedFile"
          />
        </div>

        <div class="space-y-2">
          <label
            for="document-subtype"
            class="text-sm font-semibold text-zinc-800"
          >
            Document
          </label>

          <select
            id="document-subtype"
            v-model="state.subtype"
            class="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
            required
          >
            <option :value="null" disabled>Select document subtype</option>
            <option
              v-for="option in availableSubtypeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <AppAlert
          v-if="errorMessage"
          color="error"
          :description="errorMessage"
        />

        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
            @click="emit('close')"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Uploading…' : 'Upload Document' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AppAlert from './AppAlert.vue'
import DocumentImageEditor from './DocumentImageEditor.vue'
import { apiFetch } from '../utils/apiFetch'
import { resolveMessage } from '../utils/resolveMessage'
import { useDocumentOptions } from '../composables/useDocumentOptions'
import { useImageProcessor } from '../composables/useImageProcessor'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: [Number, String],
    required: true
  },
  requirement: {
    type: Object,
    default: null
  },
  document: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close',
  'saved',
  'unauthorized'
])

const imageEditor = ref(null)
const selectedFile = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref(null)

const { getSubtypeOptions } = useDocumentOptions()
const { processImage } = useImageProcessor()

const state = reactive({
  subtype: null
})

const isReplacement = computed(() => props.document?.status === 'rejected')
const title = computed(() => isReplacement.value ? 'Replace Document' : 'Upload Document')
const description = computed(() => isReplacement.value
  ? 'Upload a replacement file for the rejected document.'
  : 'Upload a document required by this order.')
const availableSubtypeOptions = computed(() => getSubtypeOptions(props.requirement?.type))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

/**
 * Resets the upload form for the current requirement.
 *
 * @returns {void}
 */
function resetForm() {
  state.subtype = isReplacement.value
    ? props.document?.subtype ?? null
    : null

  selectedFile.value = null
  errorMessage.value = null
}

/**
 * Processes, uploads and confirms the selected document image.
 *
 * @returns {Promise<void>}
 */
async function handleSubmit() {
  if (!state.subtype) {
    errorMessage.value = 'Please select a document type.'
    return
  }

  if (!selectedFile.value) {
    errorMessage.value = 'Please select an image.'
    return
  }

  try {
    isSubmitting.value = true
    errorMessage.value = null

    const canvas = imageEditor.value?.getCanvas() ?? null
    const uploadFile = await processImage(canvas, selectedFile.value)
    const upload = await requestUploadUrl(uploadFile)

    await uploadFileToStorage(
      upload.url,
      upload.headers,
      uploadFile
    )

    const document = await confirmUpload(upload.path)

    emit('saved', document)
    emit('close')
  } catch (error) {
    if (error?.status === 401) {
      errorMessage.value = ''
        + 'Access to this page has expired. '
        + 'Please refresh the page, re-enter your order details and try again.'

      emit('unauthorized')
      return
    }

    errorMessage.value = resolveMessage(
      error,
      'The document could not be uploaded.'
    )
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Requests a temporary pre-signed upload URL from the API.
 *
 * @param {File} file
 * @returns {Promise<object>}
 */
async function requestUploadUrl(file) {
  const body = {
    type: props.requirement.type,
    subtype: state.subtype,
    mime_type: file.type,
    size: file.size
  }

  if (props.requirement.registration) {
    body.registration = props.requirement.registration
  }

  return apiFetch(
    `/v3/orders/${props.orderId}/documents/upload`,
    {
      method: 'POST',
      body
    }
  )
}

/**
 * Uploads the processed image directly to object storage.
 *
 * @param {string} url
 * @param {object} headers
 * @param {File} file
 * @returns {Promise<void>}
 */
async function uploadFileToStorage(url, headers, file) {
  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: file
  })

  if (!response.ok) {
    throw new Error(`The file upload failed with status ${response.status}.`)
  }
}

/**
 * Confirms that the temporary upload completed successfully.
 *
 * @param {string} path
 * @returns {Promise<object>}
 */
async function confirmUpload(path) {
  const body = {
    type: props.requirement.type,
    subtype: state.subtype,
    path
  }

  if (props.requirement.registration) {
    body.registration = props.requirement.registration
  }

  return apiFetch(
    `/v3/orders/${props.orderId}/documents`,
    {
      method: 'POST',
      body
    }
  )
}
</script>
