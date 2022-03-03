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
              <v-row class="align-center">
                <icon-picker v-model="category.icon" class="mr-2" />
                <v-text-field
                  v-model="category.name"
                  label="Nom de la catégorie"
                  required
                  :dense="$device.isMobile"
                >
                </v-text-field>
              </v-row>
              <v-row>
                <v-select
                  v-model="category.type"
                  :items="categoryTypes"
                  item-text="label"
                  item-value="value"
                  label="Type"
                ></v-select>
              </v-row>
              <v-row align="center">
                <v-text-field
                  v-model="category.budget"
                  :disabled="category.type !== 0"
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
        <span class="last-item">
          <v-tooltip top>
            <template #activator="{ on, attrs }">
              <v-chip v-bind="attrs" :small="$device.isMobile" v-on="on">
                {{ roulement }}
              </v-chip>
            </template>
            <span> Roulement </span>
          </v-tooltip>
          <v-btn class="last-item" icon color="success" @click="showNew">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <v-divider />
      <v-list :dense="$device.isMobile">
        <v-list-item-group v-model="selectedItem">
          <v-list-item v-for="(categ, i) in categories" :key="i">
            <v-icon
              small
              class="mr-2"
              :color="categ.type === 2 ? 'green' : 'red'"
            >
              {{ categ.icon }}
            </v-icon>
            <v-list-item-content>
              <v-list-item-title v-text="categ.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="getCategRatioColor(categ).color"
                    v-bind="attrs"
                    :small="$device.isMobile"
                    v-on="on"
                  >
                    {{ categoryUsage(categ) }}
                  </v-chip>
                </template>
                <span>
                  {{ categoryTooltip(categ) }}
                </span>
              </v-tooltip>

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
import { mapGetters } from 'vuex'
import { ECategoryType } from '~/ts/ECategoryType'
import type { Account, Category, InputCategory } from '~/ts/types'
import { toLS } from '~/ts/format'

export default Vue.extend({
  data: () => ({
    initCategory: {
      id: undefined,
      name: '',
      icon: 'mdi-wallet',
      balance: '0',
      budget: '0',
      type: ECategoryType.BUDGET,
    },
    category: {} as InputCategory,
    selectedItem: undefined,
    valid: true,
    dialog: false,
    loading: false,
  }),
  computed: {
    ...mapGetters({
      monthlyBudget: 'agenda/getCurrent',
      categories: 'categories/getCategories',
      weeksCount: 'getWeekCount',
    }),
    categoryTypes() {
      const types = [
        {
          label: 'Budget',
          value: ECategoryType.BUDGET,
        },
      ]
      // Add option for calculated if not already present
      if (
        (this.categories as Category[]).findIndex(
          ({ type }) =>
            type === ECategoryType.CALCULATED && type !== this.category.type
        ) < 0
      ) {
        types.push({
          label: 'Calculée',
          value: ECategoryType.CALCULATED,
        })
      }
      // Add option for planned credit if not already present
      if (
        (this.categories as Category[]).findIndex(
          ({ type }) =>
            type === ECategoryType.PLANNED_CREDIT && type !== this.category.type
        ) < 0
      ) {
        types.push({
          label: 'Planifié (Crédit +)',
          value: ECategoryType.PLANNED_CREDIT,
        })
      }
      // Add option for planned debit if not already present
      if (
        (this.categories as Category[]).findIndex(
          ({ type }) =>
            type === ECategoryType.PLANNED_DEBIT && type !== this.category.type
        ) < 0
      ) {
        types.push({
          label: 'Planifié (Crédit -)',
          value: ECategoryType.PLANNED_DEBIT,
        })
      }
      return types
    },
    /**
     * Formated category rest
     */
    categoryUsage() {
      return ({ balance, budget, type }: Category) => {
        const usage = budget - balance
        return toLS(type === ECategoryType.PLANNED_CREDIT ? -usage : usage)
      }
    },
    /**
     * Tooltip content of a category
     */
    categoryTooltip() {
      return (categ: Category) => {
        return `${toLS(Math.abs(categ.balance))} / ${toLS(
          Math.abs(categ.budget)
        )} (${toLS(this.getCategRatioColor(categ).ratio, {
          style: 'percent',
        })})`
      }
    },
    /**
     * Budget for auto categories
     */
    monthlyRest(): number {
      return (this.categories as Category[])
        .filter(({ type }) => type === ECategoryType.BUDGET)
        .reduce((sum, { budget }) => sum - budget, this.monthlyBudget.total)
    },
    /**
     * Total balance of account minus categories budget
     */
    roulement(): string {
      const account = this.$store.getters['account/getCurrent'] as Account
      if (account) {
        const totalBudget = (this.categories as Category[]).reduce(
          (sum, { budget }) => sum + budget,
          0
        )

        return toLS(account.balance + totalBudget)
      }
      return '0'
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
          if (this.category.type !== ECategoryType.BUDGET) {
            this.category.budget = '0'
            const cAuto = (this.categories as Category[]).find(
              (c) => c.type === this.category.type
            )
            if (cAuto && cAuto.id !== this.category.id) {
              throw new Error(
                "Vous ne pouvez avoir qu'une seule catégorie calculée"
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
        budget: (categ.budget / this.weeksCount).toString(),
        id: categ.id,
      }
      // TODO: check if id usefull
      this.dialog = true
    },
    /**
     * Calculate usage ratio of a Category
     *
     * @param categ The category
     * @param isPrimary If the 'OK' color should be primary
     */
    getCategRatioColor({ balance, budget }: Category, isPrimary = false) {
      const ratio = Math.abs(balance) / Math.abs(budget)
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
