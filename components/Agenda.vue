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
        <v-progress-linear
          :indeterminate="loading"
          :color="
            loading ? 'primary' : $device.isMobile ? 'accent' : 'transparent'
          "
        ></v-progress-linear>
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
            <v-edit-dialog
              @save="save(i, j)"
              @cancel="cancel"
              @open="open(value)"
              @close="close"
            >
              {{ value.toFixed(2) }} €
              <template v-slot:input>
                <v-text-field
                  v-model="editedValue"
                  :label="value.toFixed(2)"
                  type="number"
                  prefix="€"
                  single-line
                ></v-text-field>
              </template>
            </v-edit-dialog>
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
    loading: false,
    editedValue: '0.00',
  }),
  computed: {
    ...mapGetters({ items: 'agenda/getAgenda', month: 'agenda/getMonth' }),
  },
  methods: {
    showNew() {},
    async save(row: number, month: number) {
      this.loading = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(Object.values(this.items)[row], month)
      this.loading = false
    },
    cancel() {
      this.editedValue = '0.00'
    },
    open(value: number) {
      this.editedValue = value.toFixed(2)
    },
    close() {
      console.log('Dialog closed')
    },
  },
})
</script>
<style scoped>
.activeMonth {
  background: #1976d259;
}
</style>
