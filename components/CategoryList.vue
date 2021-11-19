<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>
          {{ category.id ? 'Editer' : 'Créer' }} une catégorie
        </v-card-title>

        <v-card-text>
          <v-form v-model="valid">
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="category.name"
                    label="Nom de la catégorie"
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="category.budget"
                    label="Budget par semaine de la catégorie"
                    type="number"
                    prefix="€"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="category.balance"
                    label="Solde de la catégorie"
                    type="number"
                    prefix="€"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
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
            @click="createCategory"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title>
        Catégories
        <v-btn class="last-item" icon color="green" @click="showNew">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>
      <v-list>
        <v-list-item-group v-model="selectedItem">
          <v-list-item v-for="(categ, i) in categories" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="categ.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-tooltip v-if="categ.budget > 0" top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="getCategRatioColor(categ)[0]"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ Math.abs(categ.balance - categ.budget * weeksCount) }} €
                  </v-chip>
                </template>
                <span>
                  {{ categ.balance }} / {{ categ.budget * weeksCount }} € ({{
                    (getCategRatioColor(categ)[1] * 100).toFixed(2)
                  }}%)
                </span>
              </v-tooltip>
              <v-chip v-else color="primary"> {{ categ.balance }} € </v-chip>

              <v-btn icon color="blue" @click="showEdit(i)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteCategory(i)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.extend({
  data: () => ({
    initCategory: {
      id: null,
      name: '',
      balance: '0',
      budget: '0',
    },
    category: {},
    selectedItem: undefined,
    valid: true,
    dialog: false,
    loading: false,
  }),
  computed: {
    ...mapGetters({ categories: 'categories/getCategories' }),
    weeksCount() {
      const d = new Date()
      const firstOfMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1)
      let day = firstOfMonth.getDay() || 6
      day = day === 1 ? 0 : day
      if (day) {
        day--
      }
      let diff = 7 - day
      const lastOfMonth = new Date(d.getFullYear(), d.getMonth(), 0)
      const lastDate = lastOfMonth.getDate()
      if (lastOfMonth.getDay() === 1) {
        diff--
      }
      const result = Math.ceil((lastDate - diff) / 7)

      return result + 1
    },
  },
  watch: {
    selectedItem() {
      this.$store.dispatch('operations/getOperations', {
        category: this.selectedItem,
      })
    },
  },
  methods: {
    async createCategory() {
      if (this.valid) {
        this.loading = true
        if ((this.category as any).id) {
          await this.$store.dispatch('categories/editCategory', this.category)
        } else {
          await this.$store.dispatch('categories/createCategory', this.category)
        }
        this.dialog = false
        this.loading = false
      }
    },
    async deleteCategory(i: number) {
      await this.$store.dispatch(
        'categories/deleteCategory',
        this.categories[i].id
      )
    },
    showNew() {
      // this.valid = false
      this.category = { ...this.initCategory }
      this.dialog = true
    },
    showEdit(i: number) {
      this.valid = true
      const categ = this.categories[i]
      this.category = { ...categ }
      ;(this.category as any).id = categ.id
      this.dialog = true
    },
    getCategRatioColor(categ: any) {
      const ratio = categ.balance / (categ.budget * this.weeksCount)
      return [ratio < 0.5 ? 'green' : ratio <= 0.75 ? 'orange' : 'red', ratio]
    },
  },
})
</script>
<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
