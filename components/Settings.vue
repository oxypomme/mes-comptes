<template>
  <v-form v-model="valid" @submit="updateSettings">
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
                v-model="settings.resetDate"
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
              v-model="settings.resetDate"
              :min="new Date().toISOString().substr(0, 10)"
              color="primary"
              @change="saveResetDate"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <v-btn
          color="green"
          :loading="loading"
          :disabled="!valid"
          block
          type="submit"
        >
          Valider
        </v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data: () => ({
    valid: false,
    menu: false,
    loading: false,
  }),
  computed: {
    settings() {
      const date = this.$store.getters.getSettings.resetDate.toDate() as Date
      return {
        ...this.$store.getters.getSettings,
        resetDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date
          .getDate()
          .toLocaleString('fr-FR', { minimumIntegerDigits: 2 })}`,
      }
    },
  },
  methods: {
    async updateSettings(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        await this.$store.dispatch('updateSettings', {
          ...this.settings,
          resetDate: new Date(this.settings.resetDate),
        })
        this.loading = false
      }
    },
    saveResetDate(date: string) {
      ;(this.$refs.menu as any).save(date)
    },
  },
})
</script>
