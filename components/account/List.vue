<template>
  <div>
    <AccountDialogEdition v-model="account" />
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Comptes</span>
        <span class="last-item">
          <v-chip
            :small="$vuetify.breakpoint.smAndDown"
            :color="totalBalanceColor"
          >
            {{ toLS(totalBalance) }}
          </v-chip>
          <v-btn
            icon
            color="success"
            :small="$vuetify.breakpoint.smAndDown"
            @click="account = false"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <v-divider />
      <v-list :dense="$vuetify.breakpoint.smAndDown">
        <v-list-item-group v-model="selectedItem" mandatory>
          <v-list-item v-for="(acc, i) in accounts" :key="acc.id">
            <v-list-item-content>
              <v-list-item-title v-text="acc.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-chip
                :small="$vuetify.breakpoint.smAndDown"
                :color="accountColor(acc)"
              >
                {{ toLS(acc.balance) }}
              </v-chip>
              <v-btn
                icon
                color="blue"
                :class="[$vuetify.breakpoint.smAndDown && 'mx-2']"
                :x-small="$vuetify.breakpoint.smAndDown"
                @click="showEdit(i)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                color="error"
                :x-small="$vuetify.breakpoint.smAndDown"
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
import { mapGetters } from 'vuex'
import type { Account, InputAccount } from '~/ts/types'
import { toLS, escapeHTML } from '~/ts/format'

export default Vue.extend({
  data: () => ({
    selectedItem: undefined,
    account: null as InputAccount | null,
  }),
  computed: {
    ...mapGetters({
      loading: 'account/getLoadingState',
    }),
    /**
     *
     */
    totalBalanceColor(): string {
      return this.totalBalance > 100
        ? 'green'
        : this.totalBalance > 0
        ? 'orange'
        : 'red'
    },
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
    toLS,
    /**
     * Delete sub account
     * @param i The index in `this.accounts`
     */
    async deleteAccount(i: number) {
      const res = await this.$dialog.confirm({
        text: `Voulez-vous supprimer le compte "${escapeHTML(
          this.accounts[i].name
        )}" ?`,
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
        try {
          await this.$store.dispatch(
            'account/deleteAccount',
            this.accounts[i].id
          )
          this.$toast.global.success('Compte supprimé')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
    /**
     * Show popup for editing a sub account
     * @param i The index in `this.accounts`
     */
    showEdit(i: number) {
      const acc = this.accounts[i]
      this.account = { ...acc, balance: acc.balance.toFixed(2), id: acc.id }
    },
    accountColor({ balance }: Account): string {
      return balance > 100 ? 'green' : balance > 0 ? 'orange' : 'red'
    },
  },
})
</script>
<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
