<template>
  <div>
    <CategoryEditionDialog v-model="category" />
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Catégories</span>
        <span class="last-item">
          <v-tooltip v-if="parseInt(roulement) > -1" top>
            <template #activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                :small="$vuetify.breakpoint.smAndDown"
                v-on="on"
              >
                {{ roulement }}
              </v-chip>
            </template>
            <span> Roulement </span>
          </v-tooltip>
          <v-btn
            class="last-item"
            icon
            color="success"
            @click="category = undefined"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <v-divider />
      <v-list :dense="$vuetify.breakpoint.smAndDown">
        <v-list-item-group>
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
                    :small="$vuetify.breakpoint.smAndDown"
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
                :class="[$vuetify.breakpoint.smAndDown && 'mx-2']"
                :x-small="$vuetify.breakpoint.smAndDown"
                @click="showEdit(i)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                :x-small="$vuetify.breakpoint.smAndDown"
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
import CategoryEditionDialog from './dialogs/CategoryEditionDialog.vue'
import { ECategoryType } from '~/ts/ECategoryType'
import type { Account, Category, InputCategory } from '~/ts/types'
import { toLS } from '~/ts/format'

export default Vue.extend({
  components: { CategoryEditionDialog },
  data: () => ({
    category: null as InputCategory | null,
  }),
  computed: {
    ...mapGetters({
      loading: 'categories/getLoadingState',
      monthlyBudget: 'agenda/getCurrent',
      categories: 'categories/getCategories',
      weeksCount: 'getWeekCount',
    }),
    /**
     * Formated category rest
     *
     * TODO: Move in getter
     */
    categoryUsage() {
      return ({ balance, budget }: Category) => {
        return toLS(budget - balance)
      }
    },
    /**
     * Tooltip content of a category
     *
     * TODO: Move in getter
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
     *
     * TODO: Move in getter
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
        let value = account.balance
        const check = {
          plannedCredit: false,
          plannedDebit: false,
        }
        for (const { budget, balance, type } of this.categories as Category[]) {
          switch (type) {
            case ECategoryType.PLANNED_CREDIT:
              value += budget - balance
              check.plannedCredit = true
              break
            case ECategoryType.PLANNED_DEBIT:
              value += balance - budget
              check.plannedDebit = true
              break
            default:
              value -= Math.max(budget - balance, 0)
              break
          }
        }

        if (check.plannedCredit && check.plannedDebit) {
          return toLS(value)
        }
        return '-1'
      }
      return '-1'
    },
  },
  methods: {
    /**
     * Delete category
     *
     * @param i The index in `this.categories`
     */
    async deleteCategory(i: number) {
      const res = await this.$dialog.confirm({
        text: `Voulez-vous supprimer la catégorie "${this.categories[i].name}" ?<br/>(cela ne supprimera pas les opérations liées)`,
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
          await this.$store.dispatch(
            'categories/deleteCategory',
            this.categories[i].id
          )
          this.$toast.global.success('Catégorie supprimée')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
    /**
     * Prepare popup for editing a category
     */
    showEdit(i: number) {
      const categ = this.categories[i]
      this.category = {
        ...categ,
        balance: categ.balance.toFixed(2),
        budget: (categ.budget / this.weeksCount).toFixed(2),
        id: categ.id,
      }
      // TODO: check if id usefull
    },
    /**
     * Calculate usage ratio of a Category
     *
     * @param categ The category
     * @param isPrimary If the 'OK' color should be primary
     *
     * TODO: Move in getter
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
