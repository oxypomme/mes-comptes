<template>
  <v-simple-table :dense="$device.isMobile">
    <template #top>
      <div>
        <v-toolbar color="#1E1E1E" flat rounded :dense="$device.isMobile">
          <v-toolbar-title class="font-weight-light">
            Planning
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="green" @click="showNew">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider class="d-block d-sm-none" />
      </div>
    </template>
    <template #default>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Categorie</th>
          <th class="text-center">Type</th>
          <th
            v-for="i in 12"
            :key="'h' + i"
            :class="[
              'text-center',
              'text-capitalize',
              currMonth == i - 1 && 'activeMonth',
            ]"
          >
            {{
              new Date(2021, i - 1).toLocaleDateString('fr', { month: 'long' })
            }}
          </th>
        </tr>
        <tr v-if="items.length > 0">
          <th colspan="3"></th>
          <th
            v-for="i in 12"
            :key="'ht' + i"
            :class="['text-center', currMonth == i - 1 && 'activeMonth']"
          >
            <v-chip small :color="month(i) > 0 ? 'green' : 'red'">
              {{ month(i).toFixed(2) }} €
            </v-chip>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="'i' + i">
          <td>{{ item.name }}</td>
          <td>{{ item.category }}</td>
          <td class="text-center">
            <v-chip
              :small="$device.isMobile"
              :color="item.modifier > 0 ? 'green' : 'red'"
            >
              {{ item.modifier > 0 ? 'Crédit (+)' : 'Débit (-)' }}
            </v-chip>
          </td>
          <td
            v-for="(value, j) in item.values"
            :key="'i' + i + 'j' + j"
            :class="['text-center', currMonth == j && 'activeMonth']"
          >
            {{ Math.abs(value).toFixed(2) }} €
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.extend({
  data: () => ({
    currMonth: new Date().getMonth(),
  }),
  computed: {
    ...mapGetters({ items: 'agenda/getAgenda', month: 'agenda/getMonth' }),
  },
  methods: {
    showNew() {},
  },
})
</script>
<style scoped>
.activeMonth {
  background: #1976d259;
}
</style>
