<template>
  <v-form v-model="valid" @submit="login">
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
          </v-text-field>
        </v-row>
        <v-row class="justify-end">
          <a href="" @click="resetPassword">Mot de passe oublié ?</a>
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
            Se connecter
          </v-btn>
        </v-row>
      </v-col>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data: () => ({
    loading: false,
    valid: false,
    showPassword: false,
    email: '',
    emailRules: [
      (v: string) => !!v || 'Un e-mail est requis',
      (v: string) => /.+@.+/.test(v) || "L'e-mail doit être valide",
    ],
    password: '',
    passwordRules: [(v: string) => !!v || 'Un mot de passe est requis'],
  }),
  methods: {
    async login(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          await this.$store.dispatch('auth/loginUser', {
            email: this.email.trim(),
            password: this.password.trim(),
          })
          this.$router.push('/dashboard')
          this.$toast.global.success('Connecté')
        } catch (e) {
          this.loading = false
          this.$toast.global.error((e as Error).message)
        }
      }
    },
    async resetPassword(e: Event) {
      e.preventDefault()
      if (this.email) {
        this.loading = true
        await this.$fire.auth.sendPasswordResetEmail(this.email.trim())
        this.$toast.global.success('E-mail de récupération envoyé')
        this.loading = false
      } else {
        this.$toast.global.error('Merci de précisez un E-mail')
      }
    },
  },
})
</script>
