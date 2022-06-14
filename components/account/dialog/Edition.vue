<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form ref="form" v-model="valid" @submit="createAccount">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title>
            {{ account.id ? 'Editer' : 'Créer' }} un compte
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon color="grey" small plain @click="show = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="account.name"
                  :rules="rules.name"
                  label="Nom du compte"
                  required
                  :dense="$vuetify.breakpoint.smAndDown"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="account.balance"
                  :rules="rules.balance"
                  label="Solde du compte"
                  type="number"
                  prefix="€"
                  :dense="$vuetify.breakpoint.smAndDown"
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="show = false"> Annuler </v-btn>
          <v-btn
            color="success"
            :loading="loading"
            :disabled="!valid"
            text
            type="submit"
            :dense="$vuetify.breakpoint.smAndDown"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import type { PropType } from 'vue'
import type { InputAccount } from '~/ts/types'
import type { VForm } from '~/ts/components'

export default Vue.extend({
  props: {
    /**
     * If val is `undefined`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    value: {
      type: Object as PropType<InputAccount | undefined | null>,
      required: false,
      default: null,
    },
  },
  data: () => ({
    valid: false,
    rules: {
      name: [(v) => !!v || 'Un nom est requis'],
      balance: [
        (v) => !!v || 'Un montant est requis',
        (v) =>
          (!isNaN(parseFloat(v)) && parseFloat(v) >= 0) ||
          'Le montant doit être supérieur ou égal à 0',
      ],
    } as Record<string, ((v: string) => true | string)[]>,
    initAccount: {
      id: undefined as string | undefined,
      name: '',
      balance: '0',
    },
    account: {} as InputAccount,
  }),
  computed: {
    ...mapGetters({
      loading: 'account/getLoadingState',
    }),
    /**
     * Dialog toggle
     */
    show: {
      get(): boolean {
        return this.value !== null
      },
      set(newValue: boolean) {
        this.$emit('input', newValue ? this.account : null)
      },
    },
  },
  watch: {
    /**
     * Reset edited operation
     */
    value(val) {
      this.account = val ?? { ...this.initAccount }
      this.validate()
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
     * Create sub account
     */
    async createAccount(e: Event) {
      e.preventDefault()
      this.validate()
      if (this.valid) {
        try {
          if (this.account.id) {
            await this.$store.dispatch('account/editAccount', this.account)
            this.$toast.global.success('Compte edité')
          } else {
            await this.$store.dispatch('account/createAccount', this.account)
            this.$toast.global.success('Compte créé')
          }
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.show = false
      }
    },
  },
})
</script>
