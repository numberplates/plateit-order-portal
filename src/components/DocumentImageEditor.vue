<template>
  <div class="space-y-3">
    <label
      class="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center transition hover:bg-zinc-100"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <span class="font-medium text-zinc-800">
        Drop a document photo here
      </span>
      <span class="mt-1 text-sm text-zinc-500">
        or choose a file
      </span>

      <input
        class="sr-only"
        type="file"
        accept="image/*,.pdf"
        @change="handleFileChange"
      />
    </label>

    <div
      v-if="file"
      class="rounded-lg border border-zinc-200 bg-white p-3"
    >
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <strong class="text-zinc-900">{{ file.name }}</strong>
          <span class="ml-2 text-zinc-500">{{ formatFileSize(file.size) }}</span>
        </div>

        <div
          v-if="isImage"
          class="flex flex-wrap gap-2"
        >
          <button
            type="button"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
            @click="rotate(-90)"
          >
            Rotate left
          </button>

          <button
            type="button"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
            @click="rotate(90)"
          >
            Rotate right
          </button>

          <button
            type="button"
            class="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
            @click="reset"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        v-if="isImage"
        class="overflow-hidden rounded-md bg-zinc-100"
      >
        <img
          ref="imageElement"
          :src="previewUrl"
          alt="Document image editor"
          class="block max-h-[460px] w-full object-contain"
        />
      </div>

      <p
        v-else
        class="text-sm text-zinc-500"
      >
        PDF files are uploaded as selected and do not require cropping.
      </p>

      <p
        v-if="isImage"
        class="mt-2 text-xs text-zinc-500"
      >
        Drag the crop area to include the relevant document and use the controls above if the photo needs rotating.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const file = defineModel('file', {
  type: Object,
  default: null
})

const imageElement = ref(null)
const previewUrl = ref(null)

let cropper = null

const isImage = computed(() => {
  return Boolean(file.value?.type?.startsWith('image/'))
})

watch(
  file,
  async (selectedFile) => {
    destroyCropper()
    revokePreviewUrl()

    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      return
    }

    previewUrl.value = URL.createObjectURL(selectedFile)

    await nextTick()

    if (!imageElement.value) {
      return
    }

    cropper = new Cropper(imageElement.value, {
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false,
      movable: true,
      rotatable: true,
      scalable: false,
      zoomable: true
    })
  },
  {
    immediate: true
  }
)

onBeforeUnmount(() => {
  destroyCropper()
  revokePreviewUrl()
})

/**
 * Stores a file selected through the native file input.
 *
 * @param {Event} event
 * @returns {void}
 */
function handleFileChange(event) {
  file.value = event.target.files?.[0] ?? null
}

/**
 * Stores the first file dropped onto the editor.
 *
 * @param {DragEvent} event
 * @returns {void}
 */
function handleDrop(event) {
  file.value = event.dataTransfer?.files?.[0] ?? null
}

/**
 * Rotates the selected image by the given number of degrees.
 *
 * @param {number} degrees
 * @returns {void}
 */
function rotate(degrees) {
  cropper?.rotate(degrees)
}

/**
 * Resets the cropper to the originally selected image.
 *
 * @returns {void}
 */
function reset() {
  cropper?.reset()
}

/**
 * Returns the cropped image canvas for upload processing.
 *
 * @returns {HTMLCanvasElement|null}
 */
function getCanvas() {
  if (!cropper) {
    return null
  }

  return cropper.getCroppedCanvas({
    maxWidth: 2400,
    maxHeight: 2400,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  })
}

/**
 * Destroys the active cropper instance.
 *
 * @returns {void}
 */
function destroyCropper() {
  cropper?.destroy()
  cropper = null
}

/**
 * Revokes the current object URL when it is no longer required.
 *
 * @returns {void}
 */
function revokePreviewUrl() {
  if (!previewUrl.value) {
    return
  }

  URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
}

/**
 * Formats a byte count for display.
 *
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

defineExpose({
  getCanvas
})
</script>
