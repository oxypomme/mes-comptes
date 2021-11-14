<template>
  <v-form v-model="valid">
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
            required
            @click:append="showPassword = !showPassword"
          ></v-text-field>
        </v-row>
        <v-row>
          <v-btn
            color="green"
            block
            :loading="loading"
            :disabled="!valid"
            @click="login"
            >Se connecter</v-btn
          >
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
    async login() {
      if (this.valid) {
        this.loading = true
        try {
          await this.$store.dispatch('auth/loginUser', {
            email: this.email,
            password: this.password,
          })
          this.$router.push('/dashboard')
        } catch (e) {
          this.loading = false
        }
      }
    },
  },
})
</script>
