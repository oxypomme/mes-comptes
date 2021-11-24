<template>
  <div class="text-center">
    <v-progress-circular indeterminate color="primary"></v-progress-circular>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  async mounted() {
    if (!this.$store.getters['auth/getUser']) {
      this.$router.push('/login')
      return
    }
    await this.$store.dispatch('auth/signOut')
    this.$router.push('/login')
  },
})
</script>
