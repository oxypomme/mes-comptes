<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>
          {{ account.id ? 'Editer' : 'Créer' }} un compte
        </v-card-title>

        <v-card-text>
          <v-form v-model="valid">
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="account.name"
                    label="Nom du compte"
                    required
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
            @click="createAccount"
          >
            Valider
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card>
      <v-card-title>
        Comptes
        <span class="last-item">
          <v-btn icon color="green" @click="showNew"
            ><v-icon>mdi-plus</v-icon></v-btn
          >
          <v-chip
            :color="
              totalBalance > 100 ? 'green' : totalBalance > 0 ? 'orange' : 'red'
            "
          >
            {{ totalBalance }} €
          </v-chip>
        </span>
      </v-card-title>
      <v-list>
        <v-list-item-group v-model="selectedItem" mandatory>
          <v-list-item v-for="(acc, i) in accounts" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="acc.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-btn icon color="blue" @click="showEdit(i)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteAccount(i)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-chip
                :color="
                  acc.balance > 100
                    ? 'green'
                    : acc.balance > 0
                    ? 'orange'
                    : 'red'
                "
              >
                {{ acc.balance }} €
              </v-chip>
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

export default Vue.extend({
  data: () => ({
    selectedItem: 0,
    initAccount: {
      id: null,
      name: '',
      balance: '0',
    },
    account: {},
    valid: true,
    dialog: false,
    loading: false,
  }),
  computed: {
    ...mapGetters({ accounts: 'account/getAccounts' }),
    totalBalance() {
      let total = 0
      for (const acc of this.accounts) {
        total += acc.balance
      }
      return total
    },
  },
  watch: {
    selectedItem() {
      this.$store.dispatch('account/selectAccount', this.selectedItem)
    },
  },
  methods: {
    async createAccount() {
      if (this.valid) {
        this.loading = true
        if ((this.account as any).id) {
          await this.$store.dispatch('account/editAccount', this.account)
        } else {
          await this.$store.dispatch('account/createAccount', this.account)
        }
        this.dialog = false
        this.loading = false
      }
    },
    async deleteAccount(i: number) {
      await this.$store.dispatch('account/deleteAccount', this.accounts[i].id)
    },
    showNew() {
      // this.valid = false
      this.account = this.initAccount
      this.dialog = true
    },
    showEdit(i: number) {
      this.valid = true
      const acc = this.accounts[i]
      this.account = { ...acc }
      ;(this.account as any).id = acc.id
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
