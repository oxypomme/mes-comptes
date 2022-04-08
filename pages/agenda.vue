<template>
  <v-container>
    <AgendaTable />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  head: {
    title: 'Planificateur - ',
  },
  mounted() {
    // Check if connected
    if (!this.$store.getters['auth/getUser']) {
      this.$router.push('/login')
      return
    }
    // Update title
    this.$store.commit('SET_TITLE', 'Planificateur')
  },
})
</script>
