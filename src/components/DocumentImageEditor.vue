<template>
  <div class="image-editor">
    <label
      v-if="!file"
      class="document-dropzone"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <span class="dropzone-title">
        Drop a document photo here
      </span>
      <span class="supporting-text">
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
      class="selected-document"
    >
      <div class="selected-document-header">
        <div>
          <strong class="file-name">{{ file.name }}</strong>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
        </div>

        <button
          type="button"
          class="portal-button portal-button-secondary"
          @click="file = null"
        >
          <ButtonIcon name="trash" />
          Remove file
        </button>

        <div
          v-if="isImage"
          class="editor-controls"
        >
          <button
            type="button"
            class="portal-button portal-button-secondary"
            @click="rotate(-90)"
          >
            <ButtonIcon name="rotate-left" />
            Rotate left
          </button>

          <button
            type="button"
            class="portal-button portal-button-secondary"
            @click="rotate(90)"
          >
            <ButtonIcon name="rotate-right" />
            Rotate right
          </button>

          <button
            type="button"
            class="portal-button portal-button-secondary"
            @click="reset"
          >
            <ButtonIcon name="reset" />
            Reset
          </button>
        </div>
      </div>

      <div
        v-if="isImage"
        class="image-editor-stage"
      >
        <img
          ref="imageElement"
          :src="previewUrl"
          alt="Document image editor"
          class="document-editor-image"
        />
      </div>

      <p
        v-else
        class="muted"
      >
        PDF files are uploaded as selected and do not require cropping.
      </p>

      <p
        v-if="isImage"
        class="editor-hint"
      >
        Drag the crop area to include the relevant document and use the controls above if the photo needs rotating.
      </p>
    </div>
  </div>
</template>

<script setup>
import ButtonIcon from './ButtonIcon.vue'
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
