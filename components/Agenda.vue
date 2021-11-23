<template>
  <v-simple-table :dense="$device.isMobile">
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
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th
            v-for="i in 12"
            :key="'ht' + i"
            :class="['text-center', currMonth == i - 1 && 'activeMonth']"
          >
            <v-chip small :color="getSum(i) > 0 ? 'green' : 'red'">
              {{ getSum(i).toFixed(2) }} €
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
export default Vue.extend({
  data: () => ({
    currMonth: new Date().getMonth(),
    items: [
      {
        name: 'Mock 1',
        category: 'Mock',
        modifier: -1,
        values: [
          257.7, 255.7, 259.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7,
          157.7, 257.7,
        ],
      },
      {
        name: 'Mock 2',
        category: 'Mock',
        modifier: 1,
        values: [
          257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7, 257.7,
          57.7, 257.7,
        ],
      },
    ],
  }),
  methods: {
    getSum(month: number) {
      return this.items
        .map((l) => [l.values[month - 1], l.modifier])
        .reduce((sum, v) => sum + v[0] * v[1], 0)
    },
  },
})
</script>
<style scoped>
.activeMonth {
  background: #1976d259;
}
</style>
