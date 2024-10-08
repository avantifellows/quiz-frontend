<template>
  <div class="locale-picker-container">
    <select
      id="locale-select"
      class="locale-select"
      v-model="selectedLocale"
      @change="changeLocale"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
    </select>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      selectedLocale: ''
    };
  },
  computed: {
    ...mapGetters(['locale']),
  },
  mounted() {
    this.selectedLocale = this.locale || 'en';
  },
  watch: {
    locale(newLocale) {
      this.selectedLocale = newLocale;
    }
  },
  methods: {
    ...mapActions(['setLocale']),
    changeLocale() {
      this.setLocale(this.selectedLocale);
      this.$i18n.locale = this.selectedLocale;
    }
  }
};
</script>

<!-- Scoped styles to enhance appearance -->
<style scoped>
.locale-picker-container {
  display: inline-block;
  margin-top: 0;
  margin-bottom: 5px;
}

.locale-select {
  padding: 6px;
  border-radius: 5px;
  border: 1px solid black;
  background-color: white;
  color: #333;
  width: 120px;
  position: relative;
}

.locale-select option {
  padding: 10px;
}

@media only screen and (max-width: 600px) {
  /* Mobile-specific styles */
  .locale-select {
    width: 100%;
    padding: 10px;
  }
}
</style>
