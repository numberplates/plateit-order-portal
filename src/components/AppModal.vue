<template>
  <div
    v-if="open"
    :class="[
      'fixed inset-0 z-50 grid place-items-center',
      backdropClass
    ]"
    @click.self="emit('close')"
  >
    <section
      :class="[
        'portal-card w-full rounded-xl border border-zinc-200 bg-white shadow-xl',
        maxWidth,
        contentClass
      ]"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
    >
      <div class="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
        <div>
          <h2
            :id="titleId"
            class="font-semibold text-zinc-950"
          >
            {{ title }}
          </h2>

          <p
            v-if="description"
            :id="descriptionId"
            class="mt-1 text-sm text-zinc-500"
          >
            {{ description }}
          </p>
        </div>

        <button
          type="button"
          class="portal-button portal-button-secondary inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
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
    default: 'max-w-2xl'
  },
  contentClass: {
    type: String,
    default: ''
  },
  backdropClass: {
    type: String,
    default: 'bg-black/50 p-5'
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
