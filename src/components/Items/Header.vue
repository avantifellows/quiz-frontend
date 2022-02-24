<template>
  <div :class="containerClass">
    <!-- skip button -->
    <icon-button
      v-if="isSkipEnabled"
      :titleConfig="skipButtonTitleConfig"
      @click="skipItem"
      :class="{ hidden: isAnswerSubmitted || previewMode }"
      :buttonClass="skipButtonClass"
      data-test="skip"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from '@/components/UI/Buttons/IconButton.vue'

export default {
  name: 'Header',
  data() {
    return {
      // styling class for the skip button
      skipButtonClass:
        'bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-full'
    }
  },
  components: { IconButton },
  computed: {
    /** main styling class for this component */
    containerClass() {
      return [
        {
          'px-6 md:px-8 xl:px-12': !this.previewMode,
          'pr-4': this.previewMode
        },
        'flex w-full bg-white justify-end p-1 space-x-2 mt-2'
      ]
    },
    /** config for the title of skip button */
    skipButtonTitleConfig() {
      return {
        value: 'Skip',
        class: 'text-white text-md sm:text-base lg:text-xl font-bold'
      }
    }
  },
  props: {
    /** whether the answer has been submitted */
    isAnswerSubmitted: {
      default: false,
      type: Boolean
    },
    /** whether the modal is in fullscreen */
    isFullscreen: {
      default: false,
      type: Boolean
    },
    /** whether the item modal will be shown in editor's mini-preview mode */
    previewMode: {
      default: false,
      type: Boolean
    },
    isSkipEnabled: {
      default: true,
      type: Boolean
    }
  },
  methods: {
    skipItem() {
      this.$emit('skip-item')
    }
  },
  emits: ['skip-item']
}
</script>
