<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="9">
        <v-row>
          <v-col>
            <v-card>
              <SettingsForm />
            </v-card>
          </v-col>
          <v-col>
            <v-card>
              <AuthSettings />
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
    title: 'Paramètres - ',
  },
  mounted() {
    // Check if connected
    if (!this.$store.getters['auth/getUser']) {
      this.$router.push('/login')
      return
    }
    // Update title
    this.$store.commit('SET_TITLE', 'Paramètres')
  },
})
</script>
