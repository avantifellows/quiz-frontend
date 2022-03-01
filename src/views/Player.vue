<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <div>
      <!-- header -->
      <item-header
        :previewMode="false"
        :isSkipEnabled="true"
        @skip-item="skipItem"
        data-test="header"
      ></item-header>
    </div>
  </div>
</template>

<script>
import ItemHeader from '@/components/Items/Header'
import { reactive, toRefs } from 'vue'

export default {
  name: 'Player',
  components: {
    ItemHeader
  },
  setup() {
    const data = reactive({
      currentItemIndex: 0,
      items: [
        {
          type: 'question',
          details: {
            type: 'mcq',
            options: ['', ''],
            correct_answer: 0,
            image: null,
            has_char_limit: false,
            max_char_limit: null
          }
        },
        {
          type: 'question',
          details: {
            type: 'subjective',
            options: null,
            correct_answer: null,
            image: null,
            has_char_limit: true,
            max_char_limit: 1000
          }
        },
        {
          type: 'question',
          details: {
            type: 'checkbox',
            options: ['', '', ''],
            correct_answer: [0, 1],
            image:
              'https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png',
            has_char_limit: false,
            max_char_limit: null
          }
        }
      ]
    })
    function skipItem() {}

    return {
      ...toRefs(data),
      skipItem
    }
  }
}
</script>
