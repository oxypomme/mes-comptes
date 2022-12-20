<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form v-model="valid" @submit="save">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title> Éditer {{ editedValue.name }} </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="grey" small plain @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-date-picker
                v-if="editedValue.field === 'date'"
                v-model="dateValue"
                :min="minDate"
                :max="maxDate"
                color="primary"
                locale="fr-FR"
                :first-day-of-week="1"
                :events="rowDates"
                event-color="primary"
                show-current
                show-adjacent-months
              ></v-date-picker>
              <v-text-field
                v-else-if="editedValue.field !== 'modifier'"
                v-model="editedValue.value"
                :rules="editedRules"
                :label="editedValue.label"
                :prefix="typeof editedValue.field === 'string' ? '' : '€'"
                :type="
                  typeof editedValue.field === 'number' ? 'number' : 'text'
                "
                required
                :dense="$vuetify.breakpoint.smAndDown"
              >
              </v-text-field>
              <v-select
                v-else
                v-model="editedValue.value"
                :items="[
                  { modifier: -1, label: 'Débit (-)' },
                  { modifier: 1, label: 'Crédit (+)' },
                ]"
                label="Type"
                :dense="$vuetify.breakpoint.smAndDown"
                item-text="label"
                item-value="modifier"
              ></v-select>
            </v-row>
            <v-row v-if="(typeof editedValue.field || '') !== 'string'">
              <v-checkbox
                v-model="editedValue.applyToAll"
                label="Appliquer à tous"
                :dense="$vuetify.breakpoint.smAndDown"
              ></v-checkbox>
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
            :dense="$vuetify.breakpoint.smAndDown"
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
import type { AgendaRow, Settings } from '~/ts/types'
import type { VForm } from '~/ts/components'
import dayjs from '~/ts/dayjs'
import type firebase from 'firebase'

export type EditedValue = {
  id: string | undefined
  name: string
  field: string | number
  value: string | number | firebase.firestore.Timestamp
  applyToAll: boolean
  label: string
}

export default Vue.extend({
  props: {
    /**
     * If val is `undefined`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    value: {
      type: Object as PropType<EditedValue | undefined | null>,
      required: false,
      default: null,
    },
  },
  data: () => ({
    valid: false,
    initValue: {
      id: undefined,
      name: '',
      field: 0,
      value: '0.00',
      applyToAll: false,
      label: '',
    } as EditedValue,
    editedValue: {} as EditedValue,
  }),
  computed: {
    ...mapGetters({
      loading: 'agenda/getLoadingState',
    }),
    /**
     * Current row names
     */
    rowNames(): { id: AgendaRow['id']; name: AgendaRow['name'] }[] {
      return (this.$store.getters['agenda/getAgenda'] as AgendaRow[]).map(
        ({ id, name }) => ({ id, name })
      )
    },
    /**
     * Current row dates
     */
    rowDates(): string[] {
      return (this.$store.getters['agenda/getAgenda'] as AgendaRow[])
        .filter(({ date, id }) => date && id !== this.editedValue.id)
        .map(({ date }) => date && dayjs(date.toDate()).format('YYYY-MM-DD'))
    },
    /**
     * Dialog toggle
     */
    show: {
      get(): boolean {
        return this.value !== null
      },
      set(newValue: boolean) {
        this.$emit('input', newValue ? this.editedValue : null)
      },
    },
    /**
     * Validation rules
     */
    editedRules(): ((v: string) => true | string)[] {
      if (typeof this.editedValue.field === 'string') {
        const rules = [(v: string) => !!v || 'Une valeur est requise']
        if (this.editedValue.field === 'name') {
          return [
            ...rules,
            (v) =>
              this.rowNames.find(
                ({ id, name }) => id !== this.editedValue.id && v === name
              ) === undefined || 'Ce nom est déjà utilisé par une autre ligne',
          ]
        }
        return rules
      } else {
        return [
          (v) => !!v || 'Un montant est requis',
          (v) =>
            (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) ||
            'Le montant doit être supérieur ou égal à 0',
        ]
      }
    },
    /**
     * The value for DatePicker
     */
    dateValue: {
      get(): string {
        return typeof this.editedValue.value === 'object'
          ? dayjs(this.editedValue.value.toDate()).format('YYYY-MM-DD')
          : ''
      },
      set(value: string) {
        if (this.editedValue.field === 'date') {
          this.editedValue.value = dayjs(value, 'YYYY-MM-DD').toFire()
        }
      },
    },
    /**
     * Minimal date for Date picker
     */
    minDate(): string {
      const settings = this.$store.getters.getSettings as Settings
      return dayjs(settings?.resetDate.toDate() ?? undefined)
        .startOf('month')
        .format('YYYY-MM-DD')
    },
    /**
     * Maxmimal date for Date picker
     */
    maxDate(): string {
      return dayjs(this.minDate).endOf('month').format('YYYY-MM-DD')
    },
  },
  watch: {
    /**
     * Reset edited operation
     */
    value(val) {
      this.editedValue = val ?? { ...this.initValue }
      this.validate()
    },
  },
  methods: {
    /**
     * Form validation
     */
    validate() {
      ;(this.$refs.form as VForm)?.validate()
    },
    /**
     * Edit a value in a row from the agenda
     *
     * @param e The event
     */
    async save(e: Event) {
      e.preventDefault()

      let value: AgendaRow[keyof AgendaRow] | number = this.editedValue.value
      let property = this.editedValue.field
      if (typeof this.editedValue.field !== 'string') {
        property = 'values'
        value = this.editValue()
      }

      try {
        await this.$store.dispatch('agenda/updateEntry', {
          id: this.editedValue.id,
          property,
          value,
        })
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }
      this.$emit('input', null)
    },
    /**
     * Edit a value in a row at a specific month from the agenda
     *
     * @returns The values of the row
     */
    editValue(): number[] {
      const items = [...this.$store.getters['agenda/getAgenda']]

      const index = items.findIndex((r) => r.id === (this.value as any).id)
      if (typeof this.editedValue.value !== 'object') {
        if (this.editedValue.applyToAll) {
          for (let i = 0; i < items[index].values.length; i++) {
            items[index].values[i] = parseFloat(
              this.editedValue.value.toString() || '0'
            )
          }
        } else {
          items[index].values[this.editedValue.field as number] = parseFloat(
            this.editedValue.value.toString() || '0'
          )
        }
      }
      return items[index].values
    },
  },
})
</script>
