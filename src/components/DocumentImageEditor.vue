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
let rotationAnimations = []

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
      autoCropArea: 0.9,
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
 * Rotates a quarter turn, preserving the selected document area and fitting the image.
 *
 * @param {number} degrees
 * @returns {void}
 */
function rotate(degrees) {
  if (!cropper) return

  const container = cropper.getContainerData()
  if (!container.width || !container.height) return

  stopRotationAnimation()
  const previousCanvas = cropper.getCanvasData()
  const previousCropBox = cropper.getCropBoxData()
  const selection = cropper.getData()
  const rotatedSelection = degrees > 0
    ? {
        x: previousCanvas.naturalHeight - selection.y - selection.height,
        y: selection.x,
        width: selection.height,
        height: selection.width
      }
    : {
        x: selection.y,
        y: previousCanvas.naturalWidth - selection.x - selection.width,
        width: selection.height,
        height: selection.width
      }

  // The existing crop box otherwise prevents viewMode 1 from zooming out.
  cropper.clear()
  cropper.rotate(degrees)

  const canvas = cropper.getCanvasData()
  const scale = Math.min(
    container.width / canvas.naturalWidth,
    container.height / canvas.naturalHeight
  )
  const width = canvas.naturalWidth * scale
  const height = canvas.naturalHeight * scale
  const left = (container.width - width) / 2
  const top = (container.height - height) / 2

  cropper.setCanvasData({ left, top, width, height })
  cropper.crop()
  cropper.setData(rotatedSelection)

  animateRotation(degrees, previousCanvas, previousCropBox)
}

/** Animates the image and its crop overlay from their previous orientation. */
function animateRotation(degrees, previousCanvas, previousCropBox) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = cropper.getCanvasData()
  const cropBox = cropper.getCropBoxData()
  const scale = (previousCanvas.width / previousCanvas.naturalWidth)
    / (canvas.width / canvas.naturalWidth)
  const stage = imageElement.value?.parentElement

  for (const [selector, previous, current] of [
    ['.cropper-canvas', previousCanvas, canvas],
    ['.cropper-crop-box', previousCropBox, cropBox]
  ]) {
    const element = stage?.querySelector(selector)
    if (!element?.animate) continue

    const startLeft = previous.left + previous.width / 2 - current.width / 2
    const startTop = previous.top + previous.height / 2 - current.height / 2
    rotationAnimations.push(element.animate([
      { transform: `translate(${startLeft}px, ${startTop}px) rotate(${-degrees}deg) scale(${scale})` },
      { transform: `translate(${current.left}px, ${current.top}px) rotate(0deg) scale(1)` }
    ], { duration: 180, easing: 'ease-out' }))
  }
}

function stopRotationAnimation() {
  rotationAnimations.forEach(animation => animation.cancel())
  rotationAnimations = []
}

/**
 * Resets the cropper to the originally selected image.
 *
 * @returns {void}
 */
function reset() {
  stopRotationAnimation()
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
  stopRotationAnimation()
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
