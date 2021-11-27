<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="createCategory">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title>
              {{ category.id ? 'Editer' : 'Créer' }} une catégorie
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="grey" small plain @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-text-field
                  v-model="category.name"
                  label="Nom de la catégorie"
                  required
                  :dense="$device.isMobile"
                >
                </v-text-field>
              </v-row>
              <v-row align="center">
                <v-checkbox
                  v-model="isWithBudget"
                  hide-details
                  class="shrink mr-2 mt-0"
                ></v-checkbox>
                <v-text-field
                  v-model="category.budget"
                  :disabled="!isWithBudget"
                  label="Budget par semaine de la catégorie"
                  type="number"
                  prefix="€"
                  :dense="$device.isMobile"
                >
                </v-text-field>
              </v-row>
              <v-row>
                <v-text-field
                  v-model="category.balance"
                  label="Solde de la catégorie"
                  type="number"
                  prefix="€"
                  :dense="$device.isMobile"
                >
                </v-text-field>
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
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Catégories</span>
        <v-btn class="last-item" icon color="success" @click="showNew">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-list :dense="$device.isMobile">
        <v-list-item-group v-model="selectedItem">
          <v-list-item v-for="(categ, i) in categories" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="categ.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-tooltip v-if="categ.budget > 0" top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="getCategRatioColor(categ).color"
                    v-bind="attrs"
                    :small="$device.isMobile"
                    v-on="on"
                  >
                    {{
                      Math.abs(
                        categ.balance - categ.budget * weeksCount
                      ).toFixed(2)
                    }}
                    €
                  </v-chip>
                </template>
                <span>
                  {{ categ.balance.toFixed(2) }} /
                  {{ (categ.budget * weeksCount).toFixed(2) }} € ({{
                    (getCategRatioColor(categ).ratio * 100).toFixed(2)
                  }}%)
                </span>
              </v-tooltip>
              <v-tooltip v-else-if="monthlyRest !== 0" top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="
                      getCategRatioColor(
                        {
                          balance: categ.balance,
                          budget: monthlyRest / weeksCount,
                        },
                        true
                      ).color
                    "
                    v-bind="attrs"
                    :small="$device.isMobile"
                    v-on="on"
                  >
                    {{ (monthlyRest - categ.balance).toFixed(2) }} €
                  </v-chip>
                </template>
                <span>
                  {{ categ.balance.toFixed(2) }} /
                  {{ monthlyRest.toFixed(2) }} € ({{
                    ((categ.balance / monthlyRest) * 100).toFixed(2)
                  }}%)
                </span>
              </v-tooltip>
              <v-chip v-else color="primary" :small="$device.isMobile">
                {{ categ.balance.toFixed(2) }} €
              </v-chip>

              <v-btn
                icon
                color="blue"
                :class="[$device.isMobile && 'mx-2']"
                :x-small="$device.isMobile"
                @click="showEdit(i)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                :x-small="$device.isMobile"
                @click="deleteCategory(i)"
              >
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
import type { Category, InputCategory } from '~/types'

export default Vue.extend({
  data: () => ({
    initCategory: {
      id: undefined,
      name: '',
      balance: '0',
      budget: '0',
    },
    category: {} as InputCategory,
    selectedItem: undefined,
    valid: true,
    dialog: false,
    loading: false,
    isWithBudget: true,
  }),
  computed: {
    /**
     * Selected account's categories
     */
    categories(): Category[] {
      return this.$store.getters['categories/getCategories']
    },
    /**
     * Current monthly budget from agenda
     */
    monthlyBudget(): number {
      return this.$store.getters['agenda/getMonth'](new Date().getMonth() + 1)
    },
    /**
     * Number of weeks in current month
     */
    weeksCount(): number {
      const resetDate =
        this.$store.getters.getSettings.resetDate?.toDate() as Date
      const prevResetDate = new Date(resetDate)
      prevResetDate.setMonth(prevResetDate.getMonth() - 1)

      const count = Math.round(
        // W * D * m * s * ms
        (resetDate.getTime() - prevResetDate.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )

      return count
    },
    /**
     * Budget for auto categories
     */
    monthlyRest(): number {
      let budget = this.monthlyBudget
      for (const categ of this.categories) {
        if (categ.budget > 0) {
          budget -= categ.budget * this.weeksCount
        }
      }
      return budget
    },
  },
  watch: {
    /**
     * Update operations in state
     */
    selectedItem() {
      this.$store.dispatch('operations/getOperations', {
        category: this.selectedItem,
      })
    },
  },
  methods: {
    /**
     * Create a new category
     *
     * @param e The event
     */
    async createCategory(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          if (!this.isWithBudget) {
            this.category.budget = '-1'
            const cAuto = this.categories.find((c) => c.budget < 0)
            if (cAuto && cAuto.id !== this.category.id) {
              throw new Error(
                "Vous ne pouvez avoir qu'une seule catégorie sans budget"
              )
            }
          }

          if (this.category.id) {
            await this.$store.dispatch('categories/editCategory', this.category)
            this.$toast.global.success('Catégorie éditée')
          } else {
            await this.$store.dispatch(
              'categories/createCategory',
              this.category
            )
            this.$toast.global.success('Catégorie créé')
          }
          this.dialog = false
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    /**
     * Delete category
     *
     * @param i The index in `this.categories`
     */
    async deleteCategory(i: number) {
      const res = await this.$dialog.confirm({
        text: 'Voulez vous supprimer la catégorie (cela ne supprimera pas les opérations liées) ?',
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
        this.loading = true
        try {
          await this.$store.dispatch(
            'categories/deleteCategory',
            this.categories[i].id
          )
          this.$toast.global.success('Catégorie supprimée')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    /**
     * Prepare popup for new category
     */
    showNew() {
      // this.valid = false
      this.category = { ...this.initCategory }
      this.dialog = true
    },
    /**
     * Prepare popup for editing a category
     */
    showEdit(i: number) {
      this.valid = true
      const categ = this.categories[i]
      this.category = {
        ...categ,
        balance: categ.balance.toString(),
        budget: categ.budget.toString(),
        id: categ.id,
      }
      // TODO: check if id usefull
      if (categ.budget < 0) {
        this.isWithBudget = false
        this.category.budget = '0'
      }
      this.dialog = true
    },
    /**
     * Calculate usage ratio of a Category
     *
     * @param categ The category
     * @param isPrimary If the 'OK' color should be primary
     */
    getCategRatioColor({ balance, budget }: Category, isPrimary = false) {
      const ratio = balance / (budget * (this.weeksCount as number))
      return {
        color:
          ratio < 0.5
            ? isPrimary
              ? 'primary'
              : 'green'
            : ratio <= 0.75
            ? 'orange'
            : 'red',
        ratio,
      }
    },
  },
})
</script>
<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
