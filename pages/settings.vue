<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="9">
        <v-row>
          <v-col>
            <v-card>
              <SettingsForm />
            </v-card>
            <v-card style="margin-top: 1.5rem">
              <SettingsInfo />
            </v-card>
          </v-col>
          <v-col>
            <v-card>
              <SettingsAuth />
            </v-card>
            <v-card style="margin-top: 1.5rem">
              <SettingsDevices />
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
  middleware: ['auth'],
  head: {
    title: 'Paramètres - ',
  },
  mounted() {
    // Update title
    this.$store.commit('SET_TITLE', 'Paramètres')
  },
})
</script>
