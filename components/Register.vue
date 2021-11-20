<template>
  <div>
    <v-dialog v-model="dialog" persistent width="500">
      <v-card>
        <v-form v-model="valid" @submit="register">
          <v-card-title>Initialisation</v-card-title>

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
              color="green"
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
              :rules="emailRules"
              label="E-mail"
              required
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              :loading="password.length > 0"
              required
            >
              <template #append>
                <v-icon
                  v-if="password.length > 0"
                  @click="showPassword = !showPassword"
                  >{{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon
                >
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
              color="green"
              class="mt-1"
              block
              :loading="loading || dialog"
              :disabled="!firstvalid"
              type="submit"
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
    balance: '0',
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
    openInit(e: Event) {
      e.preventDefault()
      if (this.firstvalid) {
        this.dialog = true
      }
    },
    async register(e: Event) {
      e.preventDefault()
      try {
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
