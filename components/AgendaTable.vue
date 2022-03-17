<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="save">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title> Éditer {{ editedValue.name }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="grey" small plain @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-text-field
                  v-if="editedValue.field !== 'modifier'"
                  v-model="editedValue.value"
                  :label="editedLabel"
                  :prefix="typeof editedValue.field === 'string' ? '' : '€'"
                  :type="
                    typeof editedValue.field === 'number' ? 'number' : 'text'
                  "
                  required
                  class="text-capitalize"
                  :dense="$vuetify.breakpoint.smAndDown"
                >
                </v-text-field>
                <v-select
                  v-else
                  v-model="editedValue.value"
                  :items="[
                    { modifier: -1, label: 'Débit (-)' },
                    { modifier: 1, label: 'Crédit (+)' },
                  ]"
                  label="Type"
                  :dense="$vuetify.breakpoint.smAndDown"
                  item-text="label"
                  item-value="modifier"
                ></v-select>
              </v-row>
              <v-row v-if="(typeof editedValue.field || '') !== 'string'">
                <v-checkbox
                  v-model="editedValue.applyToAll"
                  label="Appliquer à tous"
                ></v-checkbox>
              </v-row>
            </v-container>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="dialog = false"> Annuler </v-btn>
            <v-btn
              color="success"
              :loading="loading"
              :disabled="!valid"
              text
              type="submit"
              :dense="$vuetify.breakpoint.smAndDown"
            >
              Valider
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-simple-table
      :dense="$vuetify.breakpoint.smAndDown"
      fixed-header
      height="77vh"
    >
      <template #top>
        <div>
          <v-toolbar
            :color="$vuetify.theme.dark ? '#1E1E1E' : '#fff'"
            flat
            rounded
            :dense="$vuetify.breakpoint.smAndDown"
          >
            <v-toolbar-title class="font-weight-light">
              Planning
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="success" @click="addRow">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
          <v-progress-linear
            :indeterminate="loading"
            :color="
              loading
                ? 'primary'
                : $vuetify.breakpoint.smAndDown
                ? 'accent'
                : 'transparent'
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
                  <v-icon
                    v-if="hover || sortType === 'name'"
                    small
                    color="grey"
                  >
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
                  <v-icon
                    v-if="hover || sortType === 'type'"
                    small
                    color="grey"
                  >
                    mdi-{{ reverseSort ? 'arrow-down' : 'arrow-up' }}
                  </v-icon>
                </span>
              </v-hover>
            </th>
            <th
              v-for="monthIndex in 12"
              :key="'label' + monthIndex"
              :class="[
                'text-center',
                'text-capitalize',
                isCurrentMonth(monthIndex) && 'activeMonth',
              ]"
            >
              {{ monthLabel(monthIndex) }}
            </th>
          </tr>
          <tr v-if="Object.values(items).length > 0">
            <th colspan="4"></th>
            <th
              v-for="monthIndex in 12"
              :key="'value' + monthIndex"
              :class="[
                'text-center',
                isCurrentMonth(monthIndex) && 'activeMonth',
              ]"
            >
              <v-chip
                small
                :color="month(monthIndex).total > 0 ? 'green' : 'red'"
              >
                {{ toLS(month(monthIndex).total) }}
              </v-chip>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in [...items].sort(sorter)" :key="item.name">
            <td>
              <v-btn icon color="error" @click="deleteRow(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
            <td>
              <span class="hoverable" @click="open(item, 'name', item.name)">
                {{ item.name || '-' }}
              </span>
            </td>
            <td>
              <span
                class="hoverable"
                @click="open(item, 'category', item.category)"
              >
                {{ item.category || '-' }}
              </span>
            </td>
            <td class="text-center">
              <v-chip
                :small="$vuetify.breakpoint.smAndDown"
                :color="item.modifier > 0 ? 'green' : 'red'"
                class="hoverable"
                @click="open(item, 'modifier', item.modifier)"
              >
                {{ item.modifier > 0 ? 'Crédit (+)' : 'Débit (-)' }}
              </v-chip>
            </td>
            <td
              v-for="(value, monthIndex) in item.values"
              :key="item.name + '_month' + monthIndex"
              :class="[
                'text-center',
                isCurrentMonth(monthIndex + 1) && 'activeMonth',
              ]"
            >
              <span class="hoverable" @click="open(item, monthIndex, value)">
                {{ value > 0 ? toLS(value) : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { toLS } from '~/ts/format'
import type { AgendaRow, SettingsState } from '~/ts/types'

type SortType = 'name' | 'category' | 'type'

export default Vue.extend({
  data: () => ({
    dialog: false,
    valid: false,
    loading: false,
    editedValue: {
      id: undefined as string | undefined,
      name: '',
      field: 0 as string | number,
      value: '0.00',
      applyToAll: false,
    },
    sortType: 'type' as SortType,
    reverseSort: false,
  }),
  computed: {
    ...mapGetters({ month: 'agenda/getMonth' }),
    /**
     * Get column label
     *
     * @param i The month index (0-11)
     */
    monthLabel() {
      return (i: number) =>
        new Date(
          +this.resetDate.getFullYear() + +(i < this.resetDate.getMonth()),
          i - 1
        ).toLocaleDateString('fr', {
          month: 'long',
          year: 'numeric',
        })
    },
    /**
     * Get if month is current
     *
     * @param i The month index (0-11)
     */
    isCurrentMonth() {
      return (i: number) => this.resetDate.getMonth() === i
    },
    /**
     * Get resetDate, ussefull when gtting current month and year
     */
    resetDate(): Date {
      const settings = this.$store.getters.getSettings as
        | SettingsState
        | undefined

      return settings?.resetDate.toDate() ?? new Date()
    },
    /**
     * User's agenda
     *
     * @returns The agenda
     */
    items(): AgendaRow[] {
      return this.$store.getters['agenda/getAgenda']
    },
    /**
     * Function to sort user's agenda
     *
     * @returns The function
     */
    sorter(): (a: AgendaRow, b: AgendaRow) => number {
      let priority: (keyof Omit<AgendaRow, 'values' | 'id'>)[] = []
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
          const key = priority[i]
          res =
            key === 'modifier' ? a[key] - b[key] : a[key].localeCompare(b[key])
          i++
        }
        return this.reverseSort ? -res : res
      }
    },
    /**
     * Get the current label edited
     *
     * @returns The label
     */
    editedLabel(): string {
      if (typeof this.editedValue.field === 'string') {
        // Return the correct label
        switch (this.editedValue.field) {
          case 'name':
            return 'Nom'
          case 'category':
            return 'Catégorie'
          default:
            return 'Valeur'
        }
      } else {
        // Return the concerned month
        return this.monthLabel(this.editedValue.field + 1)
      }
    },
  },
  methods: {
    toLS,
    /**
     * Add a row to the agenda
     */
    async addRow() {
      this.loading = true
      try {
        await this.$store.dispatch('agenda/createEntry')
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
      this.loading = false
    },
    /**
     * Delete a row from the agenda
     *
     * @param id The id of the row
     */
    async deleteRow(id: string) {
      this.loading = true
      try {
        await this.$store.dispatch('agenda/deleteEntry', id)
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
      this.loading = false
    },
    /**
     * Edit a value in a row from the agenda
     *
     * @param e The event
     */
    async save(e: Event) {
      e.preventDefault()
      this.loading = true

      let value = this.editedValue.value as AgendaRow[keyof AgendaRow]
      let property = this.editedValue.field
      if (typeof this.editedValue.field !== 'string') {
        property = 'values'
        value = this.editValue()
      }

      try {
        await this.$store.dispatch('agenda/updateEntry', {
          id: this.editedValue.id,
          property,
          value,
        })
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
      this.loading = false
      this.dialog = false
    },
    /**
     * Edit a value in a row at a specific month from the agenda
     *
     * @returns The values of the row
     */
    editValue(): number[] {
      const items = [...this.items]
      const index = items.findIndex((r) => r.id === this.editedValue.id)
      if (this.editedValue.applyToAll) {
        for (let i = 0; i < items[index].values.length; i++) {
          items[index].values[i] = parseFloat(this.editedValue.value || '0')
        }
      } else {
        items[index].values[this.editedValue.field as number] = parseFloat(
          this.editedValue.value || '0'
        )
      }
      return items[index].values
    },
    /**
     * Prepare dialog to open
     *
     * @param row The row
     * @param field The field of the row
     * @param value The current value of the row
     */
    open({ id, name }: AgendaRow, field: string, value: string | number) {
      if (typeof value === 'number') {
        value = value.toFixed(2)
      }

      this.editedValue = { id, name, field, value, applyToAll: false }
      // this.valid = false
      this.dialog = true
    },
    /**
     * Edit sort type
     *
     * @param type The new sort type
     */
    changeSort(type: SortType) {
      if (type === this.sortType) {
        this.reverseSort = !this.reverseSort
      } else {
        this.sortType = type
        this.reverseSort = false
      }
    },
    /**
     * Wrapper to `Event.preventDefault`
     *
     * @param e The event
     */
    preventDefault(e: Event) {
      e.preventDefault()
    },
  },
})
</script>
<style scoped>
.activeMonth {
  background: #1976d259 !important;
}
.hoverable {
  transition: color 0.25s;
}
.hoverable:hover {
  cursor: pointer;
  color: white;
}
</style>
