<template>
  <v-simple-table :dense="$device.isMobile">
    <template #top>
      <div>
        <v-toolbar color="#1E1E1E" flat rounded :dense="$device.isMobile">
          <v-toolbar-title class="font-weight-light">
            Planning
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="green" @click="addRow">
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
          <th></th>
          <th>
            <v-hover v-slot="{ hover }" class="hoverable">
              <span @click="changeSort('name')">
                Nom
                <v-icon v-if="hover || sortType === 'name'" small color="grey">
                  mdi-{{ reverseSort ? 'arrow-up' : 'arrow-down' }}
                </v-icon>
              </span>
            </v-hover>
          </th>
          <th>
            <v-hover v-slot="{ hover }" class="hoverable">
              <span @click="changeSort('category')">
                Categorie
                <v-icon
                  v-if="hover || sortType === 'category'"
                  small
                  color="grey"
                >
                  mdi-{{ reverseSort ? 'arrow-up' : 'arrow-down' }}
                </v-icon>
              </span>
            </v-hover>
          </th>
          <th class="text-center">
            <v-hover v-slot="{ hover }" class="hoverable">
              <span @click="changeSort('type')">
                Type
                <v-icon v-if="hover || sortType === 'type'" small color="grey">
                  mdi-{{ reverseSort ? 'arrow-down' : 'arrow-up' }}
                </v-icon>
              </span>
            </v-hover>
          </th>
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
              new Date(
                2021 + (currMonth > i - 1 ? 1 : 0),
                i - 1
              ).toLocaleDateString('fr', { month: 'long', year: 'numeric' })
            }}
          </th>
        </tr>
        <tr v-if="Object.values(items).length > 0">
          <th colspan="4"></th>
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
        <tr v-for="(item, i) in [...items].sort(sorter)" :key="'i' + i">
          <td>
            <v-btn icon color="red" @click="deleteRow(item.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
          <td>
            <v-edit-dialog
              @save="save(item.id, 'name')"
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
              @save="save(item.id, 'category')"
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
              @save="save(item.id, 'modifier')"
              @cancel="cancel"
              @open="open(item.modifier)"
            >
              <v-chip
                :small="$device.isMobile"
                :color="item.modifier > 0 ? 'green' : 'red'"
                class="hoverable"
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
              @save="saveValue(item.id, j)"
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
    sortType: 'type',
    reverseSort: false,
  }),
  computed: {
    ...mapGetters({ items: 'agenda/getAgenda', month: 'agenda/getMonth' }),
    sorter() {
      let priority = []
      switch (this.sortType) {
        case 'name':
          priority = ['name', 'category', 'modifier']
          break
        case 'category':
          priority = ['category', 'name', 'modifier']
          break
        case 'type':
        default:
          priority = ['modifier', 'category', 'name']
          break
      }
      return (a, b) => {
        let res = 0
        let i = 0
        while (res === 0 && i < priority.length) {
          res =
            priority[i] === 'modifier'
              ? a[priority[i]] - b[priority[i]]
              : a[priority[i]].localeCompare(b[priority[i]])
          i++
        }
        return this.reverseSort ? -res : res
      }
    },
  },
  methods: {
    async addRow() {
      this.loading = true
      await this.$store.dispatch('agenda/createEntry')
      this.loading = false
    },
    async deleteRow(id) {
      this.loading = true
      await this.$store.dispatch('agenda/deleteEntry', id)
      this.loading = false
    },
    async save(id, property) {
      this.loading = true
      await this.$store.dispatch('agenda/updateEntry', {
        id,
        property,
        value: this.editedValue,
      })
      this.loading = false
    },
    saveValue(id, month) {
      const items = [...this.items]
      const index = items.findIndex((r) => r.id === id)
      items[index].values[month] = parseFloat(this.editedValue)
      this.editedValue = items[index].values
      this.save(id, 'values')
    },
    cancel() {
      this.editedValue = '0.00'
    },
    open(value) {
      this.editedValue = value
    },
    changeSort(type) {
      if (type === this.sortType) {
        this.reverseSort = !this.reverseSort
      } else {
        this.sortType = type
        this.reverseSort = false
      }
    },
  },
}
</script>
<style scoped>
.activeMonth {
  background: #1976d259;
}
.hoverable {
  transition: color 0.25s;
}
.hoverable:hover {
  cursor: pointer;
  color: white;
}
</style>
