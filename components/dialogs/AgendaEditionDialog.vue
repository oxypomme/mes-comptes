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
              <v-text-field
                v-if="editedValue.field !== 'modifier'"
                v-model="editedValue.value"
                :rules="editedRules"
                :label="editedLabel"
                :prefix="typeof editedValue.field === 'string' ? '' : '€'"
                :type="
                  typeof editedValue.field === 'number' ? 'number' : 'text'
                "
                required
                class="text-capitalize"
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
import type { AgendaRow, SettingsState } from '~/ts/types'
import type { VForm } from '~/ts/components'

export type EditedValue = {
  id: string | undefined
  name: string
  field: string | number
  value: string
  applyToAll: boolean
}

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
    valid: false,
    initValue: {
      id: undefined,
      name: '',
      field: 0,
      value: '0.00',
      applyToAll: false,
    } as EditedValue,
    editedValue: {} as EditedValue,
  }),
  computed: {
    ...mapGetters({
      loading: 'agenda/getLoadingState',
    }),
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
        return [(v) => !!v || 'Une valeur est requise']
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
     * Get the current label edited
     *
     * @returns The label
     */
    editedLabel(): string {
      if (typeof this.editedValue.field === 'string') {
        // Return the correct label
        switch (this.editedValue.field) {
          case 'name':
            return 'Nom'
          case 'category':
            return 'Catégorie'
          default:
            return 'Valeur'
        }
      } else {
        // Return the concerned month
        return this.monthLabel(this.editedValue.field + 1)
      }
    },
    /**
     * Get column label
     *
     * @param i The month index (0-11)
     */
    monthLabel() {
      // TODO: Move in getter
      // TODO: Duplication of AgendaTable
      return (i: number) =>
        new Date(
          +this.resetDate.getFullYear() + +(i < this.resetDate.getMonth()),
          i - 1
        ).toLocaleDateString('fr', {
          month: 'long',
          year: 'numeric',
        })
    },
    /**
     * Get resetDate, ussefull when gtting current month and year
     */
    resetDate(): Date {
      // TODO: Duplication of AgendaTable
      const settings = this.$store.getters.getSettings as
        | SettingsState
        | undefined

      return settings?.resetDate.toDate() ?? new Date()
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

      let value: AgendaRow[keyof AgendaRow] = this.editedValue.value
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
      if (this.editedValue.applyToAll) {
        for (let i = 0; i < items[index].values.length; i++) {
          items[index].values[i] = parseFloat(this.editedValue.value || '0')
        }
      } else {
        items[index].values[this.editedValue.field as number] = parseFloat(
          this.editedValue.value || '0'
        )
      }
      return items[index].values
    },
  },
})
</script>
