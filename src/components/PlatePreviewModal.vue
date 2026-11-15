<template>
  <AppModal
    :open="open"
    title="Plate Preview"
    :description="modalDescription"
    content-class="max-h-[calc(100vh-40px)] overflow-auto"
    backdrop-class="bg-black/60 p-4"
    @close="emit('close')"
  >
    <div class="flex min-h-72 flex-1 items-center justify-center overflow-auto bg-zinc-100 p-5 sm:p-8">
      <div
        v-if="isLoading"
        class="size-7 animate-spin rounded-full border-3 border-zinc-300 border-t-zinc-900"
      ></div>

      <AppAlert
        v-else-if="errorMessage"
        color="error"
        :description="errorMessage"
        class="w-full max-w-xl"
      />

      <img
        v-else-if="previewUrl"
        :src="previewUrl"
        :alt="getPreviewAlt(currentPlate)"
        class="max-h-[70vh] max-w-full object-contain"
      >

      <p
        v-else
        class="text-sm text-zinc-500"
      >
        No preview is available for this plate.
      </p>
    </div>

    <div
      v-if="canNavigate"
      class="flex items-center justify-between gap-4 border-t border-zinc-200 px-5 py-3"
    >
      <button
        type="button"
        aria-label="Previous plate"
        :disabled="!canSelectPrevious"
        class="portal-button portal-button-secondary inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="selectPrevious"
      >
        <ButtonIcon name="chevron-left" />
      </button>

      <button
        type="button"
        aria-label="Next plate"
        :disabled="!canSelectNext"
        class="portal-button portal-button-secondary inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="selectNext"
      >
        <ButtonIcon name="chevron-right" />
      </button>
    </div>
  </AppModal>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppAlert from './AppAlert.vue'
import AppModal from './AppModal.vue'
import ButtonIcon from './ButtonIcon.vue'
import { resolvePresignedDestination } from '../utils/presignedDestination'
import { resolveMessage } from '../utils/resolveMessage'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  plate: {
    type: Object,
    default: null
  },
  plates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'select'
])

const previewUrl = ref(null)
const isLoading = ref(false)
const errorMessage = ref(null)

const currentIndex = computed(() => {
  if (!props.plate) {
    return -1
  }

  return props.plates.findIndex((plate) => {
    return String(plate.id) === String(props.plate.id)
  })
})

const currentPlate = computed(() => {
  return currentIndex.value >= 0
    ? props.plates[currentIndex.value]
    : props.plate
})

const canNavigate = computed(() => {
  return props.plates.length > 1 && currentIndex.value >= 0
})

const canSelectPrevious = computed(() => canNavigate.value && currentIndex.value > 0)
const canSelectNext = computed(() => canNavigate.value && currentIndex.value < props.plates.length - 1)

const modalDescription = computed(() => {
  const registration = currentPlate.value?.registration ?? 'Number plate'

  return props.plates.length > 1
    ? `${registration} · ${currentIndex.value + 1} of ${props.plates.length}`
    : registration
})

watch(
  () => [props.open, currentPlate.value?.id],
  async ([isOpen]) => {
    if (!isOpen) {
      resetPreview()
      return
    }

    await loadPreview()
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

/**
 * Loads the temporary signed preview URL for the selected plate.
 *
 * @returns {Promise<void>}
 */
async function loadPreview() {
  const path = currentPlate.value?.design_preview

  previewUrl.value = null
  errorMessage.value = null

  if (!path) {
    return
  }

  try {
    isLoading.value = true
    previewUrl.value = await resolvePresignedDestination(path)
  } catch (error) {
    errorMessage.value = resolveMessage(
      error,
      'The plate preview could not be loaded.'
    )
  } finally {
    isLoading.value = false
  }
}

/**
 * Selects the previous plate in the collection.
 *
 * @returns {void}
 */
function selectPrevious() {
  if (!canSelectPrevious.value) {
    return
  }

  emit('select', props.plates[currentIndex.value - 1])
}

/**
 * Selects the next plate in the collection.
 *
 * @returns {void}
 */
function selectNext() {
  if (!canSelectNext.value) {
    return
  }

  emit('select', props.plates[currentIndex.value + 1])
}

/**
 * Handles keyboard navigation while the modal is open.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleKeydown(event) {
  if (!props.open) {
    return
  }

  if (event.key === 'ArrowLeft') {
    selectPrevious()
    return
  }

  if (event.key === 'ArrowRight') {
    selectNext()
  }
}

/**
 * Returns alternative text for a plate preview.
 *
 * @param {object|null} plate
 * @returns {string}
 */
function getPreviewAlt(plate) {
  return plate?.registration
    ? `Preview of ${plate.registration}`
    : 'Plate preview'
}

/**
 * Clears the current preview state.
 *
 * @returns {void}
 */
function resetPreview() {
  previewUrl.value = null
  errorMessage.value = null
  isLoading.value = false
}
</script>
