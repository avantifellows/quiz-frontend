<!-- a generic button with icon -->
<template>
  <button
    type="button"
    :class="buttonClass"
    class="flex justify-center items-center transition ease-in duration-200 text-center text-base font-semibold focus:shadow-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
  >
    <div :class="innerContainerStyleClass">
      <inline-svg
        v-if="isIconShown"
        :src="icon"
        :class="iconClass"
        class="place-self-center"
        data-test="icon"
      ></inline-svg>
      <p v-if="isTitleShown" :class="titleClass" data-test="title">
        {{ title }}
      </p>
    </div>
  </button>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'
export default {
  name: 'IconButton',
  setup(props) {
    const data = reactive({
      defaultIconConfig: {
        enabled: false,
        iconName: 'spinner-solid',
        iconClass: 'stroke-0 text-white white'
      },
      defaultTitleConfig: {
        value: '',
        class: 'text-white'
      }
    })
    const innerContainerStyleClass = computed(() => {
      return [
        {
          'flex-col': isStackedVertically.value,
          'space-x-2': !isStackedVertically.value
        },
        props.innerContainerClass
      ]
    })
    // whether the icon and text need to be stacked vertically
    const isStackedVertically = computed(() => {
      return props.orientation == 'vertical'
    })
    // name of the icon image file under assets/images
    const iconName = computed(() => {
      return localIconConfig.value.iconName
    })
    const icon = computed(() => {
      return require('@/assets/images/' + iconName.value + '.svg')
    })
    const iconClass = computed(() => {
      return localIconConfig.value.iconClass || ''
    })
    const isIconShown = computed(() => {
      return localIconConfig.value.enabled
    })
    // merges the default icon config and the icon config coming
    // as a prop -> places that into "localIconConfig"
    const localIconConfig = computed(() => {
      const localCopy = props.iconConfig
      Object.entries(data.defaultIconConfig).forEach(([key, val]) => {
        if (!(key in localCopy)) {
          localCopy[key] = val
        }
      })
      return localCopy
    })
    // merges the default title config and the title config coming
    // as a prop -> places that into "localTitleConfig"
    const localTitleConfig = computed(() => {
      const localCopy = props.titleConfig
      Object.entries(data.defaultTitleConfig).forEach(([key, val]) => {
        if (!(key in localCopy)) {
          localCopy[key] = val
        }
      })
      return localCopy
    })
    const title = computed(() => {
      return localTitleConfig.value.value
    })
    const titleClass = computed(() => {
      return localTitleConfig.value.class || ''
    })
    const isTitleShown = computed(() => {
      return localTitleConfig.value.value != null && localTitleConfig.value.value != ''
    })
    return {
      ...toRefs(data),
      innerContainerStyleClass,
      icon,
      iconName,
      iconClass,
      isIconShown,
      title,
      titleClass,
      isTitleShown
    }
  },
  props: {
    iconConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    titleConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    buttonClass: {
      type: [String, Object],
      default: () => {}
    },
    /** Style classes for the inner container of the button */
    innerContainerClass: {
      type: String,
      default: 'flex w-full justify-center'
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    orientation: {
      // whether to stack the icon and title vertically or horizontally
      type: String,
      default: 'horizontal'
    },
    ariaLabel: {
      type: String,
      default: ''
    }
  }
}
</script>
