<template>
  <v-form v-model="valid" @submit="updateSettings">
    <v-container>
      <v-col>
        <v-row>
          <h2 class="font-weight-light">Paramètres généraux</h2>
        </v-row>
        <v-row>
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
                v-model="formattedPeriod"
                label="Periode actuelle"
                hint="Utilisé pour remettre à zéro les catégories"
                persistent-hint
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="period"
              :min="limitsDates[0].format('YYYY-MM-DD')"
              :max="limitsDates[1].format('YYYY-MM-DD')"
              show-adjacent-months
              range
              color="primary"
              locale="fr-FR"
              :first-day-of-week="1"
            ></v-date-picker>
          </v-menu>
        </v-row>
        <v-row>
          <v-switch
            v-model="settings.lightTheme"
            label="Theme lumineux (BETA)"
            @click="toggleTheme"
          ></v-switch>
        </v-row>
        <v-row>
          <v-btn
            color="success"
            class="mt-4"
            :loading="loading"
            :disabled="!valid"
            block
            type="submit"
          >
            Valider
          </v-btn>
        </v-row>
      </v-col>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
import dayjs from '~/ts/dayjs'
import type { SettingsState } from '~/ts/types'

export default Vue.extend({
  data: () => ({
    valid: false,
    menu: false,
    loading: false,
    rawPeriod: [dayjs().startOf('month'), dayjs().endOf('month')],
    limitsDates: [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().add(1, 'month').endOf('month'),
    ],
  }),
  computed: {
    settings(): SettingsState {
      return this.$store.getters.getSettings
    },
    period: {
      get(): string[] {
        return this.rawPeriod.map((e) => e.format('YYYY-MM-DD'))
      },
      set(newValue: string[]) {
        this.rawPeriod = newValue.map((e) => dayjs(e, 'YYYY-MM-DD'))
      },
    },
    formattedPeriod(): string {
      return `Du ${this.rawPeriod[0]?.format('DD/MM/YYYY') ?? '...'} au ${
        this.rawPeriod[1]?.format('DD/MM/YYYY') ?? '...'
      }`
    },
  },
  mounted() {
    this.rawPeriod = [
      dayjs(this.settings.activePeriod.start.toDate()),
      dayjs(this.settings.activePeriod.end.toDate()),
    ]
  },
  methods: {
    /**
     * Edit user's settings
     */
    async updateSettings(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          await this.$store.dispatch('updateSettings', {
            ...this.settings,
            activePeriod: {
              start: this.rawPeriod[0]
                .set('hour', 0)
                .set('minute', 0)
                .set('second', 0),
              end: this.rawPeriod[1]
                .set('hour', 0)
                .set('minute', 0)
                .set('second', 0),
            },
          })
          this.$toast.global.success('Paramètres mis à jour')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    toggleTheme(e: Event) {
      this.$vuetify.theme.dark = !this.settings.lightTheme
      this.updateSettings(e)
    },
  },
})
</script>
