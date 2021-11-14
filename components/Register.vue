<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>Initialisation</v-card-title>

        <v-card-text>
          <v-form v-model="valid">
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="balance"
                    label="Solde du compte"
                    type="number"
                    suffix="€"
                    outlined
                    required
                  >
                  </v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="dialog = false"> Annuler </v-btn>
          <v-btn
            color="green"
            :loading="loading"
            :disabled="!valid"
            text
            @click="register"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-form v-model="firstvalid">
      <v-container>
        <v-col>
          <v-row>
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="E-mail"
              required
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :rules="passwordRules"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              :loading="password.length > 0"
              required
              @click:append="showPassword = !showPassword"
            >
              <template #progress>
                <v-progress-linear
                  v-if="password.length > 0"
                  :color="score.color"
                  :value="score.value"
                  absolute
                ></v-progress-linear>
              </template>
            </v-text-field>
          </v-row>
          <v-row>
            <v-btn
              color="green"
              block
              :loading="loading || dialog"
              :disabled="!firstvalid"
              @click="openInit"
              >S'inscrire</v-btn
            >
          </v-row>
        </v-col>
      </v-container>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import passStrength from 'zxcvbn'
export default Vue.extend({
  data: () => ({
    loading: false,
    firstvalid: false,
    valid: false,
    dialog: false,
    showPassword: false,
    email: '',
    emailRules: [
      (v: string) => !!v || 'Un e-mail est requis',
      (v: string) => /.+@.+/.test(v) || "L'e-mail doit être valide",
    ],
    password: '',
    passwordRules: [
      (v: string) => !!v || 'Un mot de passe est requis',
      (v: string) =>
        passStrength(v).score >= 2 || "Le mot de passe n'est pas assez fort",
    ],
    balance: 0,
  }),
  computed: {
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
    openInit() {
      if (this.firstvalid) {
        this.dialog = true
      }
    },
    async register() {
      try {
        if (this.valid) {
          this.loading = true
          await this.$store.dispatch('auth/createUser', {
            email: this.email,
            password: this.password,
            balance: this.balance,
          })
          this.$router.push('/dashboard')
        }
      } catch (e) {
        this.loading = false
        this.dialog = false
      }
    },
  },
})
</script>
