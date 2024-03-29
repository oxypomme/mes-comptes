<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form v-model="valid" @submit="createCategory">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title>
            {{ category.id ? 'Editer' : 'Créer' }} une catégorie
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="grey" small plain @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row class="align-center">
              <IconPicker v-model="category.icon" class="mr-2" />
              <v-text-field
                v-model="category.name"
                :rules="rules.name"
                label="Nom de la catégorie"
                required
                :dense="$vuetify.breakpoint.smAndDown"
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
              <div>
                <label
                  for=""
                  class="v-label theme--dark v-label--active d-block"
                  style="transform: scale(0.75); transform-origin: top left"
                >
                  Budget de la catégorie
                </label>
                <v-chip
                  class="mb-5"
                  :disabled="category.type !== 0"
                  :dense="$vuetify.breakpoint.smAndDown"
                  @click="showBudgetDialog = true"
                >
                  {{ parsedBudget ? toLS(parsedBudget) : '--,-- €' }}
                </v-chip>
              </div>
              <CategoryDialogBudgetEdition
                v-model="category.budget"
                :show="showBudgetDialog"
                @close="showBudgetDialog = false"
              >
              </CategoryDialogBudgetEdition>
            </v-row>
            <v-row>
              <v-text-field
                v-model="category.balance"
                :rules="rules.balance"
                label="Solde de la catégorie"
                type="number"
                prefix="€"
                :dense="$vuetify.breakpoint.smAndDown"
              >
              </v-text-field>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="show = false"> Annuler </v-btn>
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
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import type { PropType } from 'vue'
import type { Category, InputCategory } from '~/ts/types'
import type { VForm } from '~/ts/components'
import { ECategoryType } from '~/ts/ECategoryType'
import { parseBudget, toLS } from '~/ts/format'

export default Vue.extend({
  props: {
    /**
     * If val is `false`, a new category is requested
     * If val is `null`, we don't want to show the component
     */
    value: {
      type: [Object, Boolean] as PropType<Category | false | null>,
      required: false,
      default: null,
    },
  },
  data: () => ({
    showBudgetDialog: false,
    valid: false,
    initCategory: {
      id: undefined,
      name: '',
      icon: 'mdi-wallet',
      balance: '0',
      budget: '0',
      type: ECategoryType.BUDGET,
    },
    category: {} as InputCategory,
  }),
  computed: {
    ...mapGetters({
      loading: 'categories/getLoadingState',
      categories: 'categories/getCategories',
      nbDayInPeriod: 'getDayCount',
      nbWeekInPeriod: 'getWeekCount',
    }),
    /**
     * Parsed budget
     */
    parsedBudget(): number {
      return parseBudget(
        this.category.budget,
        this.nbDayInPeriod,
        this.nbWeekInPeriod
      )
    },
    /**
     * Field rules
     */
    rules(): Record<string, ((v: string) => true | string)[]> {
      return {
        name: [(v) => !!v || 'Un nom est requis'],
        balance: [
          (v) => !!v || 'Un montant est requis',
          (v) =>
            (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) ||
            'Le montant doit être supérieur ou égal à 0',
        ],
      }
    },
    /**
     * Category types available
     */
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
     * Dialog toggle
     */
    show: {
      get(): boolean {
        return this.value !== null
      },
      set(newValue: boolean) {
        this.$emit('input', newValue ? this.category : null)
      },
    },
  },
  watch: {
    /**
     * Reset edited operation
     */
    value(val) {
      this.category = val || { ...this.initCategory }
      this.validate()
    },
  },
  methods: {
    toLS,
    /**
     * Form validation
     */
    validate() {
      ;(this.$refs.form as VForm)?.validate()
    },
    /**
     * Create a new category
     *
     * @param e The event
     */
    async createCategory(e: Event) {
      e.preventDefault()
      this.validate()
      if (this.valid) {
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
          this.show = false
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
  },
})
</script>
