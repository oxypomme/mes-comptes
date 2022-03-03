<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="createAccount">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title>
              {{ account.id ? 'Editer' : 'Créer' }} un compte
            </v-toolbar-title>
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
                    v-model="account.name"
                    label="Nom du compte"
                    required
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="account.balance"
                    label="Solde du compte"
                    type="number"
                    prefix="€"
                    :dense="$device.isMobile"
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
              :dense="$device.isMobile"
            >
              Valider
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Comptes</span>
        <span class="last-item">
          <v-chip
            :small="$device.isMobile"
            :color="
              totalBalance > 100 ? 'green' : totalBalance > 0 ? 'orange' : 'red'
            "
          >
            {{ totalBalance.toFixed(2) }} €
          </v-chip>
          <v-btn
            icon
            color="success"
            :small="$device.isMobile"
            @click="showNew"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <v-divider />
      <v-list :dense="$device.isMobile">
        <v-list-item-group v-model="selectedItem" mandatory>
          <v-list-item v-for="(acc, i) in accounts" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="acc.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-chip
                :small="$device.isMobile"
                :color="
                  acc.balance > 100
                    ? 'green'
                    : acc.balance > 0
                    ? 'orange'
                    : 'red'
                "
              >
                {{ acc.balance.toFixed(2) }} €
              </v-chip>
              <v-btn
                icon
                color="blue"
                :class="[$device.isMobile && 'mx-2']"
                :x-small="$device.isMobile"
                @click="showEdit(i)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                :x-small="$device.isMobile"
                @click="deleteAccount(i)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { Account, InputAccount } from '~/ts/types'

export default Vue.extend({
  data: () => ({
    selectedItem: undefined,
    initAccount: {
      id: undefined as string | undefined,
      name: '',
      balance: '0',
    },
    account: {} as InputAccount,
    valid: true,
    dialog: false,
    loading: false,
  }),
  computed: {
    /**
     * The sub-accounts of the user
     */
    accounts(): Account[] {
      return this.$store.getters['account/getAccounts']
    },
    /**
     * The amount owned by the user
     */
    totalBalance() {
      let total = 0
      for (const acc of this.accounts) {
        total += acc.balance
      }
      return total
    },
  },
  watch: {
    /**
     * Change selected account in state
     */
    selectedItem() {
      this.$store.dispatch('account/selectAccount', this.selectedItem)
    },
  },
  methods: {
    /**
     * Create sub account
     */
    async createAccount(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
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
        this.dialog = false
        this.loading = false
      }
    },
    /**
     * Delete sub account
     * @param i The index in `this.accounts`
     */
    async deleteAccount(i: number) {
      const res = await this.$dialog.confirm({
        text: 'Voulez vous supprimer le compte ?',
        title: 'Attention',
        actions: {
          false: {
            text: 'Annuler',
            color: 'error',
          },
          true: {
            text: 'Confirmer',
            color: 'success',
          },
        },
      })

      if (res) {
        this.loading = true
        try {
          await this.$store.dispatch(
            'account/deleteAccount',
            this.accounts[i].id
          )
          this.$toast.global.success('Compte supprimé')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    /**
     * Show popup for adding a new sub account
     */
    showNew() {
      // this.valid = false
      this.account = { ...this.initAccount }
      this.dialog = true
    },
    /**
     * Show popup for editing a sub account
     * @param i The index in `this.accounts`
     */
    showEdit(i: number) {
      this.valid = true
      const acc = this.accounts[i]
      this.account = { ...acc, balance: acc.balance.toString(), id: acc.id }
      this.dialog = true
    },
  },
})
</script>
<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
