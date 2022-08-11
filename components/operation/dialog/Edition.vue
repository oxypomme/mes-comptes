<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit="createOperation"
      >
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
                      readonly
                      :rules="rules.date"
                      :dense="$vuetify.breakpoint.smAndDown"
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
                <v-combobox
                  v-model="operation.name"
                  hide-no-data
                  label="Nom"
                  :items="agendaRowNames"
                  required
                  :dense="$vuetify.breakpoint.smAndDown"
                  :rules="rules.name"
                  @change="onAutocompleteSelection"
                >
                </v-combobox>
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
                  :rules="rules.amount"
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
import type { PropType } from 'vue'
import { mapGetters } from 'vuex'
import dayjs from '~/ts/dayjs'
import { ECategoryType } from '~/ts/ECategoryType'
import type {
  ValueModifier,
  InputOperation,
  Category,
  AgendaRow,
} from '~/ts/types'
import type { VForm, VMenu } from '~/ts/components'

export default Vue.extend({
  props: {
    /**
     * If val is `false`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    value: {
      type: [Object, Boolean] as PropType<InputOperation | false | null>,
      required: false,
      default: null,
    },
  },
  data: () => ({
    valid: false,
    menu: false,
    rules: {
      name: [(v) => !!v || 'Un nom est requis'],
      amount: [
        (v) => !!v || 'Un montant est requis',
        (v) => !isNaN(parseFloat(v)) || 'Le montant doit être un nombre',
        (v) =>
          (!isNaN(parseFloat(v)) && parseFloat(v) > 0) ||
          'Le montant doit être supérieur à 0',
      ],
      date: [
        (v) => !!v || 'Une date est requise',
        (v) =>
          dayjs(v, 'DD/MM/YYYY').isBefore(dayjs()) ||
          'Impossible créer une opération future',
      ],
    } as Record<string, ((v: string) => true | string)[]>,
    initOperation: {
      name: '',
      amount: '',
      category: null,
      modifier: -1 as ValueModifier,
      date: dayjs(),
    },
    operation: {} as InputOperation,
    agendaRowIndex: undefined as number | undefined,
  }),
  computed: {
    ...mapGetters({
      loading: 'operations/getLoadingState',
      agendaRowNames: 'agenda/getAgendaRowNames',
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
        const date = this.operation.date ?? dayjs()
        return date.format('YYYY-M-D')
      },
      set(newValue: string) {
        this.operation.date = dayjs(newValue, 'YYYY-M-D')
      },
    },
    formatedDate(): string {
      return (this.operation?.date ?? dayjs()).format('DD/MM/YYYY')
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
      this.validate()
    },
  },
  methods: {
    /**
     * Set type and category by searching in autocompletion data
     */
    onAutocompleteSelection(value: string) {
      // If value is an agenda row
      const agendaRowNames = this.agendaRowNames as string[]
      if (agendaRowNames.includes(value)) {
        // Getting agenda row
        const rowIndex = agendaRowNames.findIndex((s) => s === value)
        const agendaRow = {
          ...this.$store.getters['agenda/getAgenda'][rowIndex],
        } as AgendaRow
        // Setting modifier
        this.operation.modifier = agendaRow.modifier
        // Setting category
        const categType =
          agendaRow.modifier > 0
            ? ECategoryType.PLANNED_CREDIT
            : ECategoryType.PLANNED_DEBIT
        this.operation.category =
          this.selectCategories.find(({ type }) => type === categType)?.id ??
          null
        // Setting value
        const currentMonth = this.$store.getters.getCurrentMonth.value as number
        this.operation.amount = agendaRow.values[currentMonth - 1].toString()
        // Prepare for updating agenda row
        this.agendaRowIndex = rowIndex
      }
    },
    /**
     * Form validation
     */
    validate() {
      ;(this.$refs.form as VForm)?.validate()
    },
    /**
     * Create an operation
     */
    async createOperation(e: Event) {
      e.preventDefault()
      this.validate()
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

            if (this.agendaRowIndex !== undefined) {
              this.$store.dispatch('agenda/updateStatus', {
                id: (
                  this.$store.getters['agenda/getAgenda'][
                    this.agendaRowIndex
                  ] as AgendaRow
                ).id,
                status: true,
              })
              this.agendaRowIndex = undefined
            }
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
      ;(this.$refs.menu as VMenu).save(date)
    },
  },
})
</script>
