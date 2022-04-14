<template>
  <v-text-field
    :value="password"
    :rules="rules"
    label="Mot de passe"
    autocomplete="new-password"
    :type="showPassword ? 'text' : 'password'"
    :loading="password.length > 0"
    required
    @input="(v) => $emit('input', v)"
  >
    <template #append>
      <v-icon v-if="password.length > 0" @click="showPassword = !showPassword">
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
</template>

<script lang="ts">
import Vue from 'vue'
import passStrength from 'zxcvbn'

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    rules: [
      (v: string) => !!v || 'Un mot de passe est requis',
      (v: string) =>
        passStrength(v).score >= 2 || "Le mot de passe n'est pas assez fort",
    ],
  }),
  computed: {
    /**
     * Password strength
     */
    score() {
      switch (passStrength(this.value).score) {
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
})
</script>
