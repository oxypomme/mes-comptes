<template>
  <v-container>
    <AgendaTable />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  middleware: ['auth'],
  head: {
    title: 'Planificateur',
  },
  mounted() {
    // Update title
    this.$store.commit('SET_TITLE', 'Planificateur')
  },
})
</script>
