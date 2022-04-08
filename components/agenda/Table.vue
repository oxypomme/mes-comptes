<template>
  <div>
    <AgendaDialogEdition v-model="editedValue" />
    <v-simple-table :dense="$vuetify.breakpoint.smAndDown">
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
                currentMonth === monthIndex && 'activeMonth',
              ]"
            >
              {{ month(monthIndex).label }}
            </th>
          </tr>
          <tr v-if="Object.values(items).length > 0">
            <th colspan="4"></th>
            <th
              v-for="monthIndex in 12"
              :key="'value' + monthIndex"
              :class="[
                'text-center',
                currentMonth === monthIndex && 'activeMonth',
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
                currentMonth === monthIndex + 1 && 'activeMonth',
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
import type { EditedValue } from './dialog/Edition.vue'
import { toLS } from '~/ts/format'
import type { AgendaRow } from '~/ts/types'

type SortType = 'name' | 'category' | 'type'

export default Vue.extend({
  data: () => ({
    editedValue: null as EditedValue | null,
    sortType: 'type' as SortType,
    reverseSort: false,
  }),
  computed: {
    ...mapGetters({
      month: 'agenda/getMonth',
      loading: 'agenda/getLoadingState',
    }),
    /**
     * Get current month
     */
    currentMonth(): number {
      const { resetDate } = this.$store.getters.getSettings
      return resetDate?.toDate().getMonth() ?? new Date().getMonth()
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
  },
  methods: {
    toLS,
    /**
     * Add a row to the agenda
     */
    async addRow() {
      try {
        await this.$store.dispatch('agenda/createEntry')
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
    },
    /**
     * Delete a row from the agenda
     *
     * @param id The id of the row
     */
    async deleteRow(id: string) {
      try {
        await this.$store.dispatch('agenda/deleteEntry', id)
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
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

      let label = ''
      if (typeof field === 'string') {
        // Return the correct label
        switch (field) {
          case 'name':
            label = 'Nom'
            break
          case 'category':
            label = 'Catégorie'
            break
          default:
            label = 'Valeur'
            break
        }
      } else {
        // Return the concerned month
        label = this.month(field + 1).label
      }

      this.editedValue = { id, name, field, value, applyToAll: false, label }
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
