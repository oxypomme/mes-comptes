<template>
  <div v-if="account">
    <OperationEditionDialog v-model="operation" />
    <OperationHistoryDialog v-model="historyDialog" />
    <v-data-table
      :headers="headers"
      :items="operations"
      :items-per-page="$device.isMobile ? 1 : 15"
      :loading="loading"
      class="elevation-1"
      :dense="$device.isMobile"
    >
      <template #top>
        <div>
          <v-toolbar
            :color="$vuetify.theme.dark ? '#1E1E1E' : '#fff'"
            flat
            rounded
            :dense="$device.isMobile"
          >
            <v-toolbar-title class="font-weight-light">
              Opérations
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="historyDialog = true">
              <v-icon>mdi-history</v-icon>
            </v-btn>
            <v-btn icon color="success" @click="operation = undefined">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider class="d-block d-sm-none" />
        </div>
      </template>
      <template #[`item.date`]="{ item }">
        {{ item.date.toDate().toLocaleDateString() }}
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip
          :small="$device.isMobile"
          :color="item.amount > 0 ? 'green' : 'red'"
        >
          {{ item.amount > 0 ? 'Crédit (+)' : 'Débit (-)' }}
        </v-chip>
      </template>
      <template #[`item.amount`]="{ item }">
        {{ toLS(Math.abs(item.amount)) }}
      </template>
      <template #[`item.category`]="{ item }">
        <v-icon v-if="item.category" small>
          {{ item.category.icon }}
        </v-icon>
        {{ item.category ? item.category.name : '' }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn icon color="blue" @click="showEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="error" @click="deleteOperation(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import OperationEditionDialog from './dialogs/OperationEditionDialog.vue'
import OperationHistoryDialog from './dialogs/OperationHistoryDialog.vue'
import { toLS } from '~/ts/format'
import type { InputOperation, Operation } from '~/ts/types'

export default Vue.extend({
  components: { OperationEditionDialog, OperationHistoryDialog },
  data: () => ({
    selectedMonth: { label: 'Courant (1 mois)' },
    headers: [
      {
        text: 'Date',
        align: 'start',
        value: 'date',
        sortable: false,
      },
      { text: 'Titre', value: 'name', sortable: false },
      { text: 'Type', value: 'type', sortable: false },
      { text: 'Montant', value: 'amount', sortable: false },
      { text: 'Catégorie', value: 'category', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    operation: null as InputOperation | null,
    historyDialog: false,
  }),
  computed: {
    ...mapGetters({
      account: 'account/getCurrent',
      ops: 'operations/getOperations',
      loading: 'operations/getLoadingState',
    }),
    /**
     * Current account's operations
     */
    operations(): Operation[] {
      return [...this.ops]
    },
  },
  methods: {
    toLS,
    /**
     * Delete an operation
     */
    async deleteOperation(id: string) {
      try {
        await this.$store.dispatch('operations/deleteOperation', id)
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
    },
    /**
     * Prepare popup to edit a operation
     */
    showEdit(item: Operation) {
      this.operation = {
        ...item,
        date: item.date?.toDate(),
        amount: Math.abs(item.amount).toFixed(2),
        modifier: item.amount > 0 ? 1 : -1,
        id: item.id,
      }
    },
  },
})
</script>
