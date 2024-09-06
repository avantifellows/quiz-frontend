<template>
  <div>
    <select v-model="selectedLocale" @change="changeLocale">
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <!-- Add more languages dynamically if needed -->
    </select>
    <p>{{ $t('Select Language') }}</p> <!-- Assuming you use vue-i18n for translations -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      selectedLocale: this.locale
    };
  },
  computed: {
    ...mapGetters(['locale'])
  },
  watch: {
    // Watch Vuex store's locale and update the selectedLocale accordingly
    locale(newLocale) {
      this.selectedLocale = newLocale;
    }
  },
  methods: {
    ...mapActions(['setLocale']),
    changeLocale() {
      this.setLocale(this.selectedLocale);
      // If using vue-i18n, update its locale here
      this.$i18n.locale = this.selectedLocale;
    }
  }
}
</script>
