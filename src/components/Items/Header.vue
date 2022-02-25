<template>
  <div :class="containerClass">
    <!-- skip button -->
    <icon-button
      v-if="isSkipEnabled"
      :titleConfig="skipButtonTitleConfig"
      :buttonClass="skipButtonClass"
      @click="skipItem"
      data-test="skip"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from '@/components/UI/Buttons/IconButton.vue'
import { reactive, toRefs, computed } from 'vue'

export default {
  name: 'Header',
  setup(props, context) {
    const data = reactive({
      // styling class for the skip button
      skipButtonClass:
        'bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none h-full'
    })
    function skipItem() {
      context.emit('skip-item')
    }
    // main styling class for this component
    const containerClass = computed(() => {
      return [
        {
          'px-6 md:px-8 xl:px-12': !props.previewMode,
          'pr-4': props.previewMode
        },
        'flex w-full bg-white justify-end p-1 space-x-2 mt-2'
      ]
    })
    // config for the title of skip button
    const skipButtonTitleConfig = computed(() => {
      return {
        value: 'Skip',
        class: 'text-white text-md sm:text-base lg:text-xl font-bold'
      }
    })

    return {
      ...toRefs(data),
      skipItem,
      containerClass,
      skipButtonTitleConfig
    }
  },
  components: { IconButton },
  props: {
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
  emits: ['skip-item']
}
</script>
