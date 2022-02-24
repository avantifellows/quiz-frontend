<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <div>
      <!-- header -->
      <item-header
        :isAnswerSubmitted="false"
        :isModalMinimized="false"
        :isFullscreen="false"
        :previewMode="false"
        @toggle-minimize="toggleMinimize"
        @skip-item="skipItem"
        :isSkipEnabled="true"
        data-test="header"
      ></item-header>
    </div>
  </div>
</template>

<script>
import ItemHeader from '@/components/Items/Header'

export default {
  name: 'Player',
  components: {
    ItemHeader
  },
  data() {
    return {
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
    }
  },
  methods: {
    toggleMinimize() {},
    skipItem() {}
  }
}
</script>
