<template>
  <v-row justify="center" align="center"> TODO </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  mounted() {
    if (this.$store.getters['auth/getUser']) {
      this.$router.push('/dashboard')
    }
  },
})
</script>
