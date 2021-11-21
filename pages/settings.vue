<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="9">
        <v-row>
          <v-col>
            <v-card>
              <Settings />
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
    this.$store.commit('SET_TITLE', 'Paramètres')
  },
})
</script>
