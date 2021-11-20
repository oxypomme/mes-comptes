<template>
  <div v-if="account">
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="createOperation">
          <v-card-title>
            {{ operation.id ? 'Editer' : 'Créer' }} une opération
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field v-model="operation.name" label="Nom" required>
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
                    label="Type"
                  ></v-select>
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="operation.amount"
                    label="Montant"
                    type="number"
                    prefix="€"
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
    >
      <template #header.actions="">
        <v-btn icon color="green" @click="showNew">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
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
        <v-chip :color="item.amount > 0 ? 'green' : 'red'">
          {{ item.amount > 0 ? 'Crédit (+)' : 'Débit (-)' }}
        </v-chip>
      </template>
      <template #item.amount="{ item }">
        {{ Math.abs(item.amount) }} €
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
      modifier: -1,
    },
    operation: {},
    dialog: false,
    valid: true,
  }),
  computed: {
    ...mapGetters({
      account: 'account/getCurrent',
      categories: 'categories/getCategories',
      ops: 'operations/getOperations',
    }),

    pageCount() {
      return Math.ceil((this.account?.operationCount ?? 0) / this.items)
    },
    operations() {
      return [...this.ops.data]
    },
  },
  watch: {
    async page() {
      this.loading = true
      await this.$store.dispatch('operations/getOperations', {
        limit: this.items,
      })
      this.loading = false
    },
  },
  methods: {
    async createOperation(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          if ((this.operation as any).id) {
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
    async deleteOperation({ id, amount, category }: any) {
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
    showNew() {
      // this.valid = false
      this.operation = { ...this.initOperation }
      this.dialog = true
    },
    showEdit(item: any) {
      this.valid = true
      this.operation = { ...item }
      ;(this.operation as any).id = item.id
      this.dialog = true
    },
  },
})
</script>
