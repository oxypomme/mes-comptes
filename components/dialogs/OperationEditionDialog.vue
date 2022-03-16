<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form v-model="valid" @submit="createOperation">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title>
            {{ operation.id ? 'Editer' : 'Créer' }} une opération
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="grey" small plain @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formatedDate"
                      label="Date"
                      persistent-hint
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="date"
                    :max="maxDate"
                    color="primary"
                    locale="fr-FR"
                    :first-day-of-week="1"
                    @change="saveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="operation.name"
                  label="Nom"
                  required
                  :dense="$vuetify.breakpoint.smAndDown"
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
                  :dense="$vuetify.breakpoint.smAndDown"
                  label="Type"
                ></v-select>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="operation.amount"
                  label="Montant"
                  type="number"
                  prefix="€"
                  :dense="$vuetify.breakpoint.smAndDown"
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
                  :dense="$vuetify.breakpoint.smAndDown"
                ></v-select>
              </v-col>
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
import dayjs from '~/ts/dayjs'
import { ECategoryType } from '~/ts/ECategoryType'
import type { ValueModifier, InputOperation, Category } from '~/ts/types'

export default Vue.extend({
  props: {
    /**
     * If val is `undefined`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    // eslint-disable-next-line vue/require-prop-types
    value: {
      required: true,
    },
  },
  data: () => ({
    valid: true, // TODO: validation
    menu: false,
    initOperation: {
      name: '',
      amount: '',
      category: null,
      modifier: -1 as ValueModifier,
      date: new Date(),
    },
    operation: {} as InputOperation,
  }),
  computed: {
    ...mapGetters({
      loading: 'operations/getLoadingState',
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
     * Maximal date for Date picker
     */
    maxDate() {
      return dayjs().format('YYYY-MM-DD')
    },
    /**
     * Operation date
     */
    date: {
      get(): string {
        return dayjs(this.operation.date).format('YYYY-M-D')
      },
      set(newValue: string) {
        this.operation.date = dayjs(newValue, 'YYYY-M-D').toDate()
      },
    },
    formatedDate() {
      return this.operation?.date?.toLocaleDateString()
    },
    /**
     * Dialog toggle
     */
    show: {
      get(): boolean {
        return this.value !== null
      },
      set(newValue: boolean) {
        this.$emit('input', newValue ? this.operation : null)
      },
    },
  },
  watch: {
    /**
     * Reset edited operation
     */
    value(val) {
      this.operation = val ?? { ...this.initOperation }
    },
  },
  methods: {
    /**
     * Create an operation
     */
    async createOperation(e: Event) {
      e.preventDefault()
      if (this.valid) {
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
          }
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.show = false
      }
    },
    /**
     * Save value from DatePicker
     */
    saveDate(date: string) {
      ;(this.$refs.menu as Element & { save: (data: any) => any }).save(date)
    },
  },
})
</script>
