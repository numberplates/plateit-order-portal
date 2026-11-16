<template>
  <div
    v-if="open"
    :class="[
      'modal-backdrop',
      backdropClass
    ]"
    @click.self="emit('close')"
  >
    <section
      :class="[
        'portal-card modal-panel',
        maxWidth,
        contentClass
      ]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
    >
      <div class="modal-header">
        <div>
          <h2
            :id="titleId"
            class="section-title"
          >
            {{ title }}
          </h2>

          <p
            v-if="description"
            :id="descriptionId"
            class="supporting-text"
          >
            {{ description }}
          </p>
        </div>

        <button
          type="button"
          class="portal-button portal-button-secondary"
          @click="emit('close')"
        >
          <ButtonIcon name="close" />
          Close
        </button>
      </div>

      <slot />
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import ButtonIcon from './ButtonIcon.vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: 'modal-standard'
  },
  contentClass: {
    type: String,
    default: ''
  },
  backdropClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const titleId = `modal-title-${Math.random().toString(36).slice(2)}`
const descriptionId = `modal-description-${Math.random().toString(36).slice(2)}`

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

/**
 * Closes the modal when Escape is pressed.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleKeydown(event) {
  if (
    props.open &&
    event.key === 'Escape'
  ) {
    emit('close')
  }
}
</script>
