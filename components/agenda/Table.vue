<template>
  <div>
    <AgendaDialogEdition v-model="editedValue" />
    <AgendaDialogDetails v-model="detailedValue" />
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
            <th colspan="1"></th>
            <th>
              <v-hover v-slot="{ hover }" class="hoverable">
                <span @click="changeSort('date')">
                  Date
                  <v-icon
                    v-if="hover || sortType === 'date'"
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
                currentMonth.value === monthIndex && 'activeMonth',
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
                currentMonth.value === monthIndex && 'activeMonth',
              ]"
            >
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-chip
                    small
                    :color="month(monthIndex).total > 0 ? 'green' : 'red'"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ toLS(month(monthIndex).total) }}
                  </v-chip>
                </template>
                <span>
                  {{ toLS(month(monthIndex).credit) }}
                  - {{ toLS(month(monthIndex).debit) }}
                </span>
              </v-tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in [...items].sort(sorter)" :key="item.id">
            <td>
              <div class="d-flex align-center">
                <v-btn icon color="error" @click="deleteRow(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon color="blue" @click="openDetail(item)">
                  <v-icon>mdi-information</v-icon>
                </v-btn>
                <v-simple-checkbox
                  :value="item.status"
                  :ripple="false"
                  style="margin-left: 0.5rem"
                  @input="updateStatus(item.id, $event)"
                ></v-simple-checkbox>
              </div>
            </td>
            <td>
              <span style="cursor: default">
                {{ item.date ? formatDate(item.date) : '-' }}
              </span>
            </td>
            <td>
              <span
                class="hoverable"
                @click="openEdit(item, 'name', item.name)"
              >
                {{ item.name || '-' }}
              </span>
            </td>
            <td class="text-center">
              <v-chip
                :small="$vuetify.breakpoint.smAndDown"
                :color="item.modifier > 0 ? 'green' : 'red'"
                class="hoverable"
                @click="openEdit(item, 'modifier', item.modifier)"
              >
                {{ item.modifier > 0 ? 'Crédit (+)' : 'Débit (-)' }}
              </v-chip>
            </td>
            <td
              v-for="(value, monthIndex) in item.values"
              :key="item.name + '_month' + monthIndex"
              :class="[
                'text-center',
                currentMonth.value === monthIndex + 1 && 'activeMonth',
              ]"
            >
              <span
                class="hoverable"
                @click="openEdit(item, monthIndex, value)"
              >
                {{ value > 0 ? toLS(value, item.currency || 'EUR') : '-' }}
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
import { escapeHTML, toLS } from '~/ts/format'
import type { AgendaRow, InputAgendaRow } from '~/ts/types'
import dayjs from '~/ts/dayjs'
import type firebase from 'firebase'

type SortType = 'name' | 'type' | 'date'
type OmitKeys = 'values' | 'id' | 'status' | 'category' | 'account' | 'currency'

export default Vue.extend({
  data: () => ({
    editedValue: null as EditedValue | null,
    detailedValue: null as InputAgendaRow | null,
    sortType: 'type' as SortType,
    reverseSort: false,
  }),
  computed: {
    ...mapGetters({
      month: 'agenda/getMonth',
      loading: 'agenda/getLoadingState',
      currentMonth: 'getCurrentMonth',
    }),
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
      let priority: (keyof Omit<AgendaRow, OmitKeys>)[] = []
      switch (this.sortType) {
        case 'name':
          priority = ['name', 'modifier', 'date']
          break
        case 'date':
          priority = ['date', 'name', 'modifier']
          break
        case 'type':
        default:
          priority = ['modifier', 'name', 'date']
          break
      }
      return (a, b) => {
        let res = 0
        let i = 0
        while (res === 0 && i < priority.length) {
          const key = priority[i]
          if (key === 'date') {
            res = dayjs(a[key].toDate()).diff(dayjs(b[key].toDate()))
          } else if (key === 'modifier') {
            res = a[key] - b[key]
          } else {
            res = a[key].localeCompare(b[key])
          }
          i++
        }
        return this.reverseSort ? -res : res
      }
    },
  },
  methods: {
    toLS,
    /**
     * Format item date
     */
    formatDate(timestamp: firebase.firestore.Timestamp): string {
      return dayjs(timestamp.toDate()).format('DD/MM/YYYY')
    },
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
      const res = await this.$dialog.confirm({
        text: `Voulez-vous supprimer la ligne "${escapeHTML(
          this.items.find(({ id: rid }) => id === rid)?.name
        )}" ?`,
        title: 'Attention',
        actions: {
          false: {
            text: 'Annuler',
            color: 'error',
          },
          true: {
            text: 'Confirmer',
            color: 'success',
          },
        },
      })

      if (res) {
        try {
          await this.$store.dispatch('agenda/deleteEntry', id)
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
    /**
     * Prepare edit dialog to open
     *
     * @param row The row
     * @param field The field of the row
     * @param value The current value of the row
     */
    openEdit(
      { id, name, currency }: AgendaRow,
      field: keyof AgendaRow | number,
      value: EditedValue['value']
    ) {
      if (typeof value === 'number' && field !== 'modifier') {
        value = value.toFixed(2)
      }

      let label = ''
      if (typeof field === 'string') {
        // Return the correct label
        switch (field) {
          case 'name':
            label = 'Nom'
            break
          default:
            label = 'Valeur'
            break
        }
      } else {
        // Return the concerned month
        label = this.month(field + 1).label
      }

      this.editedValue = {
        id,
        name,
        field,
        value,
        applyToAll: false,
        label,
        currency,
      }
    },
    /**
     * Prepare detail dialog to open
     */
    openDetail(row: AgendaRow) {
      let category = row.category
      if (typeof category !== 'string') {
        category = category.id
      }

      const account = row.account?.id

      this.detailedValue = {
        ...row,
        id: row.id,
        category,
        date: dayjs(row.date.toDate()),
        account: account ?? null,
      }
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
     * Update status of a row
     */
    async updateStatus(id: string, status: boolean) {
      try {
        await this.$store.dispatch('agenda/updateStatus', { id, status })
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
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
