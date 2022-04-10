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
                v-model="formatedDate"
                label="Changement de mois le"
                hint="Utilisé pour remettre à zéro les catégories"
                persistent-hint
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="resetDate"
              :min="minDate"
              :max="maxDate"
              color="primary"
              locale="fr-FR"
              :first-day-of-week="1"
              @change="saveResetDate"
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
    rawDate: dayjs(),
  }),
  computed: {
    settings(): SettingsState {
      return this.$store.getters.getSettings
    },
    resetDate: {
      get(): string {
        return dayjs(this.rawDate).format('YYYY-M-D')
      },
      set(newValue: string) {
        this.rawDate = dayjs(newValue, 'YYYY-M-D')
      },
    },
    formatedDate(): string {
      return this.rawDate.format('DD/MM/YYYY')
    },
    /**
     * Minimal date for Date picker
     */
    minDate(): string {
      return dayjs(this.settings?.resetDate.toDate() ?? undefined)
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
  mounted() {
    this.rawDate = dayjs(this.settings.resetDate.toDate())
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
            resetDate: this.rawDate,
          })
          this.$toast.global.success('Paramètres mis à jour')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    saveResetDate(date: string) {
      ;(this.$refs.menu as Element & { save: (data: any) => any }).save(date)
    },
    toggleTheme(e: Event) {
      this.$vuetify.theme.dark = !this.settings.lightTheme
      this.updateSettings(e)
    },
  },
})
</script>
