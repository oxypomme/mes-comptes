<template>
  <v-container>
    <v-row justify="center">
      <v-col>
        <!-- <v-card> -->
        <Agenda />
        <!-- </v-card> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  head: {
    title: 'Planificateur - ',
  },
  mounted() {
    this.$store.commit('SET_TITLE', 'Planificateur')
  },
})
</script>
