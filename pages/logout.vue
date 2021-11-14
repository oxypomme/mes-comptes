<template>
  <div></div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  async mounted() {
    await this.$store.dispatch('auth/signOut')
    this.$router.push('/login')
  },
})
</script>
