<template>
  <div>
    <v-dialog v-model="dialog" persistent width="500">
      <v-card>
        <v-form ref="form" v-model="valid" lazy-validation @submit="register">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title>Initialisation</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="grey" small plain @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="balance"
                    label="Solde du compte"
                    type="number"
                    prefix="€"
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="dialog = false"> Annuler </v-btn>
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
    <v-form v-model="firstvalid" @submit="openInit">
      <v-container>
        <v-col>
          <v-row>
            <v-text-field
              v-model="email"
              :rules="rules.email"
              label="E-mail"
              type="email"
              autocomplete="email"
              required
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="password"
              :rules="rules.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :loading="password.length > 0"
              required
            >
              <template #append>
                <v-icon
                  v-if="password.length > 0"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
                </v-icon>
              </template>
              <template #progress>
                <v-progress-linear
                  v-if="password.length > 0"
                  :color="score.color"
                  :value="score.value"
                  height="2"
                  absolute
                ></v-progress-linear>
              </template>
            </v-text-field>
          </v-row>
          <v-row>
            <v-btn
              color="success"
              class="mt-1"
              block
              :loading="loading || dialog"
              :disabled="!firstvalid"
              type="submit"
            >
              S'inscrire
            </v-btn>
          </v-row>
        </v-col>
      </v-container>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import passStrength from 'zxcvbn'
import type { VForm } from '~/ts/components'

export default Vue.extend({
  data: () => ({
    loading: false,
    firstvalid: false,
    valid: false,
    dialog: false,
    showPassword: false,
    email: '',
    password: '',
    rules: {
      email: [
        (v: string) => !!v || 'Un e-mail est requis',
        (v: string) => /.+@.+/.test(v) || "L'e-mail doit être valide",
      ],
      password: [
        (v: string) => !!v || 'Un mot de passe est requis',
        (v: string) =>
          passStrength(v).score >= 2 || "Le mot de passe n'est pas assez fort",
      ],
    },
    balance: '0',
  }),
  computed: {
    /**
     * Password strength
     */
    score() {
      switch (passStrength(this.password).score) {
        case 4:
          return {
            color: 'light-blue',
            value: 100,
          }
        case 3:
          return {
            color: 'light-green',
            value: 75,
          }
        case 2:
          return {
            color: 'yellow',
            value: 50,
          }
        case 1:
          return {
            color: 'orange',
            value: 25,
          }
        default:
          return {
            color: 'red',
            value: 0,
          }
      }
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
     * Open dialog for additonal fields
     */
    openInit(e: Event) {
      e.preventDefault()
      if (this.firstvalid) {
        this.dialog = true
      }
    },
    /**
     * Register new user
     */
    async register(e: Event) {
      e.preventDefault()
      try {
        this.validate()
        if (this.valid) {
          this.loading = true
          await this.$store.dispatch('auth/createUser', {
            email: this.email.trim(),
            password: this.password.trim(),
            balance: this.balance.trim(),
          })
          this.$router.push('/dashboard')
          this.$toast.global.success('Compte créé')
        }
      } catch (e) {
        this.loading = false
        this.dialog = false
        this.$toast.global.error((e as Error).message)
      }
    },
  },
})
</script>
