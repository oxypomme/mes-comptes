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
                <v-col v-if="!operation.id">
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
                    :items="categories"
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
              color="green"
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
      :page.sync="page"
      :items-per-page="items"
      :loading="loading"
      class="elevation-1"
      hide-default-footer
      :dense="$device.isMobile"
    >
      <template #top>
        <div>
          <v-toolbar color="#1E1E1E" flat rounded :dense="$device.isMobile">
            <v-toolbar-title class="font-weight-light">
              Opérations
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="green" @click="showNew">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider class="d-block d-sm-none" />
        </div>
      </template>
      <template #item.createdAt="{ item }">
        {{
          (item.createdAt
            ? item.createdAt.toDate()
            : new Date()
          ).toLocaleDateString()
        }}
      </template>
      <template #item.type="{ item }">
        <v-chip
          :small="$device.isMobile"
          :color="item.amount > 0 ? 'green' : 'red'"
        >
          {{ item.amount > 0 ? 'Crédit (+)' : 'Débit (-)' }}
        </v-chip>
      </template>
      <template #item.amount="{ item }">
        {{ Math.abs(item.amount).toFixed(2) }} €
      </template>
      <template #item.category="{ item }">
        {{ item.category ? item.category.name : '' }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon color="blue" @click="showEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="deleteOperation(item)">
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

export default Vue.extend({
  data: () => ({
    page: 1,
    items: 100,
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
      category: '',
      modifier: -1 as ValueModifier,
    },
    operation: {} as InputOperation,
    dialog: false,
    valid: true,
  }),
  computed: {
    ...mapGetters({
      account: 'account/getCurrent',
      categories: 'categories/getCategories',
      ops: 'operations/getOperations',
    }),

    /**
     * Number of pages in total
     * @deprecated Unused because pagination in not implemented
     */
    pageCount() {
      return Math.ceil(
        ((this.account as Account | null)?.operationCount ?? 0) / this.items
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
    async page() {
      this.loading = true
      await this.$store.dispatch('operations/getOperations', {
        limit: this.items,
      })
      this.loading = false
    },
  },
  methods: {
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
    async deleteOperation({ id, amount, category }: Operation) {
      this.loading = true
      try {
        await this.$store.dispatch('operations/deleteOperation', {
          id,
          amount,
          category,
        })
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
      this.operation = { ...item, amount: item.amount.toString(), id: item.id }
      this.dialog = true
    },
  },
})
</script>
