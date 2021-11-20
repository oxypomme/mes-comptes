<template>
  <v-form v-model="valid" @submit="updateAuth">
    <v-container>
      <v-col>
        <v-row>
          <h2 class="font-weight-light">Paramètres de connexion</h2>
        </v-row>
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
            class="mt-4"
            type="submit"
            block
            :loading="loading"
            :disabled="!valid"
          >
            Valider
          </v-btn>
        </v-row>
        <v-row>
          <v-btn
            color="red"
            class="mt-4"
            block
            :loading="loading"
            :disabled="!valid"
            @click="deleteAuth"
          >
            Supprimer le compte
          </v-btn>
        </v-row>
      </v-col>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
import passStrength from 'zxcvbn'

export default Vue.extend({
  data: () => ({
    loading: false,
    valid: false,
    showPassword: false,
    emailRules: [
      (v: string) => !!v || 'Un e-mail est requis',
      (v: string) => /.+@.+/.test(v) || "L'e-mail doit être valide",
    ],
    rawemail: null as string | null,
    password: '',
    passwordRules: [
      (v: string) => !!v || 'Un mot de passe est requis',
      (v: string) =>
        passStrength(v).score >= 2 || "Le mot de passe n'est pas assez fort",
    ],
  }),
  computed: {
    email: {
      get() {
        const { email } = this.$store.getters['auth/getUser']
        return this.rawemail?.trim() ?? email
      },
      set(value: string) {
        this.rawemail = value
      },
    },
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
    async updateAuth(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          const { email } = this.$store.getters['auth/getUser']

          await this.$store.dispatch('auth/updateUser', {
            email: this.email && this.email !== email ? this.email : undefined,
            password: this.password.trim(),
          })
          this.$toast.global.success('Compte mis à jour')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    async deleteAuth() {
      if (this.valid) {
        this.loading = true
        const res = await this.$dialog.error({
          text: 'Voulez vous supprimer votre compte ? Cette action est irréversible.',
          title: 'Attention',
          actions: {
            false: {
              text: 'Annuler',
            },
            true: {
              text: 'Confirmer',
              color: 'red',
            },
          },
        })
        if (res) {
          try {
            await this.$store.dispatch('auth/deleteUser')
            this.$router.push('/login')
            this.$toast.global.success('Compte supprimé')
          } catch (e) {
            this.$toast.global.error((e as Error).message)
          }
        }
        this.loading = false
      }
    },
  },
})
</script>
