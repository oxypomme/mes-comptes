<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="9">
        <v-row>
          <v-col>
            <v-card>
              <Login />
            </v-card>
          </v-col>
          <v-col>
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
})
</script>
