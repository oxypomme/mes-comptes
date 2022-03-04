<template>
  <div v-if="account">
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="createOperation">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title>
              {{ operation.id ? 'Editer' : 'Créer' }} une opération
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="grey" small plain @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="operation.name"
                    label="Nom"
                    required
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    v-model="operation.modifier"
                    :items="[
                      { name: 'Crédit +', modifier: 1 },
                      { name: 'Débit -', modifier: -1 },
                    ]"
                    item-text="name"
                    item-value="modifier"
                    required
                    :dense="$device.isMobile"
                    label="Type"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="operation.amount"
                    label="Montant"
                    type="number"
                    prefix="€"
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    v-model="operation.category"
                    :items="selectCategories"
                    item-text="name"
                    item-value="id"
                    label="Catégorie"
                    :dense="$device.isMobile"
                  ></v-select>
                </v-col>
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
            >
              Valider
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-data-table
      :headers="headers"
      :items="operations"
      :items-per-page="ops.items"
      :loading="loading"
      class="elevation-1"
      hide-default-footer
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
            <v-btn icon color="success" @click="showNew">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider class="d-block d-sm-none" />
        </div>
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{
          (item.createdAt
            ? item.createdAt.toDate()
            : new Date()
          ).toLocaleDateString()
        }}
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
    <v-pagination
      v-if="pageCount > 1"
      v-model="page"
      :length="pageCount"
      :dense="$device.isMobile"
    ></v-pagination>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { ECategoryType } from '~/ts/ECategoryType'
import { toLS } from '~/ts/format'
import type {
  Account,
  Category,
  InputOperation,
  Operation,
  ValueModifier,
} from '~/ts/types'

export default Vue.extend({
  data: () => ({
    page: 1,
    loading: false,
    headers: [
      {
        text: 'Date',
        align: 'start',
        value: 'createdAt',
        sortable: false,
      },
      { text: 'Titre', value: 'name', sortable: false },
      { text: 'Type', value: 'type', sortable: false },
      { text: 'Montant', value: 'amount', sortable: false },
      { text: 'Catégorie', value: 'category', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    initOperation: {
      name: '',
      amount: '',
      category: null,
      modifier: -1 as ValueModifier,
    },
    operation: {} as InputOperation,
    dialog: false,
    valid: true,
  }),
  computed: {
    ...mapGetters({
      account: 'account/getCurrent',
      ops: 'operations/getOperations',
    }),
    /**
     * Options for select categories
     */
    selectCategories(): Category[] {
      const categs = this.$store.getters['categories/getCategories']
      return [
        {
          id: null,
          name: '',
          balance: 0,
          budget: 0,
          type: ECategoryType.BUDGET,
        },
        ...categs,
      ]
    },
    /**
     * Number of pages in total
     */
    pageCount() {
      return Math.ceil(
        ((this.account as Account | null)?.operationCount ?? 0) / this.ops.items
      )
    },
    /**
     * Current account's operations
     */
    operations(): Operation[] {
      return [...this.ops.data]
    },
  },
  watch: {
    /**
     * Fetch more operations on page change
     */
    async page(newValue, lastValue) {
      this.loading = true
      await this.$store.dispatch('operations/getOperations', {
        progression: newValue - lastValue,
      })
      this.loading = false
    },
  },
  methods: {
    toLS,
    /**
     * Create an operation
     */
    async createOperation(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          if (this.operation.id) {
            await this.$store.dispatch('operations/editOperation', {
              ...this.operation,
            })
            this.$toast.global.success('Opération editée')
          } else {
            await this.$store.dispatch(
              'operations/createOperation',
              this.operation
            )
            // this.$toast.global.success('Opération créée')
          }
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.dialog = false
        this.loading = false
      }
    },
    /**
     * Delete an operation
     */
    async deleteOperation(id: string) {
      this.loading = true
      try {
        await this.$store.dispatch('operations/deleteOperation', id)
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
      this.loading = false
    },
    /**
     * Prepare popup for new operation
     */
    showNew() {
      // this.valid = false
      this.operation = { ...this.initOperation }
      this.dialog = true
    },
    /**
     * Prepare popup to edit a operation
     */
    showEdit(item: Operation) {
      this.valid = true
      this.operation = {
        ...item,
        amount: Math.abs(item.amount).toFixed(2),
        modifier: item.amount > 0 ? 1 : -1,
        id: item.id,
      }
      this.dialog = true
    },
  },
})
</script>
