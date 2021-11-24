<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="4" lg="3" order="2" order-sm="1">
        <AccountList />
        <CategoryList class="mt-6" />
      </v-col>
      <v-col cols="12" sm="8" lg="9" order="1" order-sm="2">
        <OperationList />
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  mounted() {
    if (!this.$store.getters['auth/getUser']) {
      this.$router.push('/login')
      return
    }
    this.$store.commit('SET_TITLE', 'Tableau de bord')
  },
})
</script>
