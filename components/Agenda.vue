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
        <tr v-if="Object.values(items).length > 0">
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
          <td>
            <v-edit-dialog
              @save="save(i, 'name')"
              @cancel="cancel"
              @open="open(item.name)"
            >
              {{ item.name }}
              <template #input>
                <v-text-field
                  v-model="editedValue"
                  :label="item.name"
                  type="text"
                  single-line
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </td>
          <td>
            <v-edit-dialog
              @save="save(i, 'category')"
              @cancel="cancel"
              @open="open(item.category)"
            >
              {{ item.category }}
              <template #input>
                <v-text-field
                  v-model="editedValue"
                  :label="item.category"
                  type="text"
                  single-line
                ></v-text-field>
              </template>
            </v-edit-dialog>
          </td>
          <td class="text-center">
            <v-edit-dialog
              @save="save(i, 'modifier')"
              @cancel="cancel"
              @open="open(item.modifier)"
            >
              <v-chip
                :small="$device.isMobile"
                :color="item.modifier > 0 ? 'green' : 'red'"
                class="hoverable-chip"
              >
                {{ item.modifier > 0 ? 'Crédit (+)' : 'Débit (-)' }}
              </v-chip>
              <template #input>
                <v-select
                  v-model="editedValue"
                  :items="[
                    { modifier: -1, label: 'Débit (-)' },
                    { modifier: 1, label: 'Crédit (+)' },
                  ]"
                  :label="item.modifier > 0 ? 'Crédit (+)' : 'Débit (-)'"
                  item-text="label"
                  item-value="modifier"
                  single-line
                ></v-select>
              </template>
            </v-edit-dialog>
          </td>
          <td
            v-for="(value, j) in item.values"
            :key="'i' + i + 'j' + j"
            :class="['text-center', currMonth == j && 'activeMonth']"
          >
            <v-edit-dialog
              @save="saveValue(i, j)"
              @cancel="cancel"
              @open="open(value.toFixed(2))"
            >
              {{ value.toFixed(2) }} €
              <template #input>
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

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    currMonth: new Date().getMonth(),
    loading: false,
    editedValue: '0.00',
  }),
  computed: {
    ...mapGetters({ items: 'agenda/getAgenda', month: 'agenda/getMonth' }),
  },
  methods: {
    async showNew() {
      this.loading = true
      await this.$store.dispatch('agenda/createEntry')
      this.loading = false
    },
    async save(index, property) {
      this.loading = true
      await this.$store.dispatch('agenda/updateEntry', {
        index,
        property,
        value: this.editedValue,
      })
      this.loading = false
    },
    saveValue(index, month) {
      const items = { ...this.items }
      items[index].values[month] = parseFloat(this.editedValue)
      this.editedValue = items[index].values
      this.save(index, 'values')
    },
    cancel() {
      this.editedValue = '0.00'
    },
    open(value) {
      this.editedValue = value
    },
  },
}
</script>
<style scoped>
.activeMonth {
  background: #1976d259;
}
.hoverable-chip:hover {
  cursor: pointer;
}
</style>
