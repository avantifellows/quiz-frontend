<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <div>
      <!-- header -->
      <item-header @skip-item="skipItem" data-test="header"></item-header>
    </div>
  </div>
</template>

<script lang="ts">
import ItemHeader from "../components/Items/Header.vue";
import { defineComponent, reactive, toRefs } from "vue";
import { Item } from "../types";
export default defineComponent({
  name: "Player",
  components: {
    ItemHeader,
  },
  setup() {
    const state = reactive({
      currentItemIndex: 0 as number,
      items: [
        {
          type: "question",
          details: {
            type: "mcq",
            options: ["", ""],
            correct_answer: 0,
            image: null,
            has_char_limit: false,
            max_char_limit: null,
          },
        },
        {
          type: "question",
          details: {
            type: "subjective",
            options: null,
            correct_answer: null,
            image: null,
            has_char_limit: true,
            max_char_limit: 1000,
          },
        },
        {
          type: "question",
          details: {
            type: "checkbox",
            options: ["", "", ""],
            correct_answer: [0, 1],
            image:
              "https://plio-prod-assets.s3.ap-south-1.amazonaws.com/images/afbxudrmbl.png",
            has_char_limit: false,
            max_char_limit: null,
          },
        },
      ] as Item[],
    });
    function skipItem() {}

    return {
      ...toRefs(state),
      skipItem,
    };
  },
});
</script>
