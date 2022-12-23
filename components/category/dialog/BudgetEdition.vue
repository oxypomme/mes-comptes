<template>
  <v-dialog v-model="shouldShow" width="500">
    <v-card>
      <v-form v-model="valid" @submit="submitBudget">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title> Editer un budget </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="grey" small plain @click="shouldShow = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              Variables possibles :
              <ul>
                <li class="mb-3">
                  <code>nbDayInPeriod(1-7)</code> : Nombre de fois que le jour
                  choisi est présent dans le mois
                  <ul class="grid">
                    <li
                      v-for="i in 7"
                      :key="i"
                      style="text-transform: capitalize"
                      @click="addVar(`nbDayInPeriod(${i})`)"
                    >
                      {{ i }} - {{ dayName(i) }}:
                      <code>{{ nbDayInPeriod(i) }}</code>
                    </li>
                  </ul>
                </li>
                <li class="mb-3" @click="addVar('nbWeekInPeriod')">
                  <code>nbWeekInPeriod</code> : Le nombre de semaine dans la
                  période
                  <ul>
                    <li>
                      Actuel: <code>{{ nbWeekInPeriod }}</code>
                    </li>
                  </ul>
                </li>
              </ul>
            </v-row>
            <v-row class="pt-2">
              <v-text-field
                v-model="budget"
                :rules="rules.budget"
                label="Budget de la catégorie"
                prefix="€"
                :dense="$vuetify.breakpoint.smAndDown"
              >
              </v-text-field>
            </v-row>

            <v-row align="center">
              Résultat :
              <v-chip :dense="$vuetify.breakpoint.smAndDown" class="ml-2">
                {{ parsedBudget ? toLS(parsedBudget) : '--,-- €' }}
              </v-chip>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="shouldShow = false">
            Annuler
          </v-btn>
          <v-btn color="success" :disabled="!valid" text type="submit">
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
import type { VForm } from '~/ts/components'
import dayjs from '~/ts/dayjs'
import { parseBudget, toLS } from '~/ts/format'

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: false,
      default: '0',
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    budget: '',
    valid: false,
  }),
  computed: {
    ...mapGetters({
      nbDayInPeriod: 'getDayCount',
      nbWeekInPeriod: 'getWeekCount',
    }),
    /**
     * Parsed budget
     */
    parsedBudget(): number {
      return parseBudget(this.budget, this.nbDayInPeriod, this.nbWeekInPeriod)
    },
    /**
     * Field rules
     */
    rules(): Record<string, ((v: string) => true | string)[]> {
      return {
        budget: [
          (v) => !!v || 'Un montant est requis',
          (_v) => !isNaN(this.parsedBudget) || "La formule n'est pas correcte",
        ],
      }
    },
    /**
     * Dialog toggle
     */
    shouldShow: {
      get(): boolean {
        return this.show
      },
      set(newValue: boolean) {
        if (!newValue) {
          this.$emit('close')
        }
      },
    },
  },
  watch: {
    value() {
      this.budget = this.value
    },
    show() {
      this.budget = this.value
    },
  },
  methods: {
    toLS,
    /**
     * Get day name
     *
     * @param i The day index (1-7)
     */
    dayName(i: number): string {
      return dayjs()
        .day(i >= 7 ? 0 : i)
        .format('dddd')
    },
    /**
     * Helper to add variable
     */
    addVar(varname: string) {
      this.budget += ` ${varname}`
    },
    /**
     * Form validation
     */
    validate() {
      ;(this.$refs.form as VForm)?.validate()
    },
    /**
     * Submit budget
     */
    submitBudget(e: Event) {
      e.preventDefault()
      this.validate()
      this.shouldShow = false
      this.$emit('input', this.budget.trim())
    },
    /**
     * Cancel edition
     */
    cancel() {
      this.shouldShow = false
    },
  },
})
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: auto;
}
</style>
