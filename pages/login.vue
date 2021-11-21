<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-card>
              <Login />
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card>
              <Register />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  head: {
    title: 'Connexion - ',
  },
  mounted() {
    this.$store.commit('SET_TITLE', 'Connexion')
  },
})
</script>
