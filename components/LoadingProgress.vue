<template>
  <v-overlay dark opacity="1" :value="loading">
    <v-progress-circular color="primary" indeterminate size="64">
    </v-progress-circular>
  </v-overlay>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data: () => ({
    loading: false,
  }),
  methods: {
    start() {
      this.loading = true
    },
    finish() {
      this.loading = false
    },
  },
})
</script>
