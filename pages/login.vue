<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="6">
        <v-row>
          <v-col cols="12" sm="6" :order="showLogin ? 1 : 2">
            <v-card>
              <LoginForm v-if="showLogin" />
              <v-btn v-else block color="primary" @click="showLogin = true">
                Déja inscrit ?
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" :order="showRegister ? 1 : 2">
            <v-card>
              <RegisterForm v-if="showRegister" />
              <v-btn v-else block color="primary" @click="showRegister = true">
                Pas encore inscrit ?
              </v-btn>
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
  data: () => ({
    rawShowRegister: false,
  }),
  head: {
    title: 'Connexion',
  },
  computed: {
    showRegister: {
      get(): boolean {
        return !this.$vuetify.breakpoint.xsOnly || this.rawShowRegister
      },
      set(value: boolean) {
        this.rawShowRegister = value
      },
    },
    showLogin: {
      get(): boolean {
        return !this.$vuetify.breakpoint.xsOnly || !this.rawShowRegister
      },
      set(value: boolean) {
        this.rawShowRegister = !value
      },
    },
  },
  mounted() {
    // Update title
    this.$store.commit('SET_TITLE', 'Connexion')
  },
})
</script>
