/**
 * Provides browser-side image preparation for document uploads.
 *
 * @returns {object}
 */
export function useImageProcessor() {
  /**
   * Converts the cropped editor canvas into an uploadable image file.
   *
   * Non-image files are returned unchanged. If no crop canvas is available,
   * the selected image is loaded and resized as a fallback.
   *
   * @param {HTMLCanvasElement|null} canvas
   * @param {File} file
   * @returns {Promise<File>}
   */
  async function processImage(canvas, file) {
    if (!file.type.startsWith('image/')) {
      return file
    }

    const sourceCanvas = canvas ?? await fileToCanvas(file)
    const outputCanvas = resizeCanvas(sourceCanvas, 2400)

    const blob = await canvasToBlob(
      outputCanvas,
      'image/jpeg',
      0.9
    )

    return new File(
      [blob],
      replaceExtension(file.name, 'jpg'),
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    )
  }

  return {
    processImage
  }
}

/**
 * Loads an image file into a canvas.
 *
 * @param {File} file
 * @returns {Promise<HTMLCanvasElement>}
 */
async function fileToCanvas(file) {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)

  return canvas
}

/**
 * Resizes a canvas so its longest dimension does not exceed the maximum.
 *
 * @param {HTMLCanvasElement} source
 * @param {number} maxDimension
 * @returns {HTMLCanvasElement}
 */
function resizeCanvas(source, maxDimension) {
  const scale = Math.min(
    1,
    maxDimension / Math.max(source.width, source.height)
  )

  if (scale === 1) {
    return source
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(source.width * scale)
  canvas.height = Math.round(source.height * scale)

  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    source,
    0,
    0,
    canvas.width,
    canvas.height
  )

  return canvas
}

/**
 * Converts a canvas to a Blob.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('The image could not be processed.'))
      },
      type,
      quality
    )
  })
}

/**
 * Loads a file into an image element.
 *
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('The selected image could not be loaded.'))
    }

    image.src = url
  })
}

/**
 * Replaces the extension on a filename.
 *
 * @param {string} filename
 * @param {string} extension
 * @returns {string}
 */
function replaceExtension(filename, extension) {
  const base = filename.replace(/\.[^.]+$/, '')
  return `${base}.${extension}`
}
