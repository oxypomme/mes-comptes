<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form v-model="valid" @submit="createCategory">
          <v-toolbar elevation="0" dense>
            <v-toolbar-title>
              {{ category.id ? 'Editer' : 'Créer' }} une catégorie
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
                    v-model="category.name"
                    label="Nom de la catégorie"
                    required
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="category.budget"
                    label="Budget par semaine de la catégorie"
                    type="number"
                    prefix="€"
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="category.balance"
                    label="Solde de la catégorie"
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
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Catégories</span>
        <v-btn class="last-item" icon color="green" @click="showNew">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-list :dense="$device.isMobile">
        <v-list-item-group v-model="selectedItem">
          <v-list-item v-for="(categ, i) in categories" :key="i">
            <v-list-item-content>
              <v-list-item-title v-text="categ.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-tooltip v-if="categ.budget > 0" top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="getCategRatioColor(categ)[0]"
                    v-bind="attrs"
                    :small="$device.isMobile"
                    v-on="on"
                  >
                    {{
                      Math.abs(
                        categ.balance - categ.budget * weeksCount
                      ).toFixed(2)
                    }}
                    €
                  </v-chip>
                </template>
                <span>
                  {{ categ.balance.toFixed(2) }} /
                  {{ (categ.budget * weeksCount).toFixed(2) }} € ({{
                    (getCategRatioColor(categ)[1] * 100).toFixed(2)
                  }}%)
                </span>
              </v-tooltip>
              <v-chip v-else color="primary" :small="$device.isMobile">
                {{ categ.balance.toFixed(2) }} €
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
                color="red"
                :x-small="$device.isMobile"
                @click="deleteCategory(i)"
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

export default Vue.extend({
  data: () => ({
    initCategory: {
      id: null,
      name: '',
      balance: '0',
      budget: '0',
    },
    category: {},
    selectedItem: undefined,
    valid: true,
    dialog: false,
    loading: false,
  }),
  computed: {
    ...mapGetters({ categories: 'categories/getCategories' }),
    weeksCount() {
      const resetDate = this.$store.getters.getSettings.resetDate?.toDate()
      const prevResetDate = new Date(resetDate)
      prevResetDate.setMonth(prevResetDate.getMonth() - 1)

      const count = Math.round(
        // W * D * m * s * ms
        (resetDate - (prevResetDate as any)) / (7 * 24 * 60 * 60 * 1000)
      )

      return count
    },
  },
  watch: {
    selectedItem() {
      this.$store.dispatch('operations/getOperations', {
        category: this.selectedItem,
      })
    },
  },
  methods: {
    async createCategory(e: Event) {
      e.preventDefault()
      if (this.valid) {
        this.loading = true
        try {
          if ((this.category as any).id) {
            await this.$store.dispatch('categories/editCategory', this.category)
            this.$toast.global.success('Catégorie éditée')
          } else {
            await this.$store.dispatch(
              'categories/createCategory',
              this.category
            )
            this.$toast.global.success('Catégorie créé')
          }
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.dialog = false
        this.loading = false
      }
    },
    async deleteCategory(i: number) {
      const res = await this.$dialog.confirm({
        text: 'Voulez vous supprimer la catégorie (cela ne supprimera pas les opérations liées) ?',
        title: 'Attention',
        actions: {
          false: {
            text: 'Annuler',
            color: 'red',
          },
          true: {
            text: 'Confirmer',
            color: 'green',
          },
        },
      })
      if (res) {
        this.loading = true
        try {
          await this.$store.dispatch(
            'categories/deleteCategory',
            this.categories[i].id
          )
          this.$toast.global.success('Catégorie supprimée')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.loading = false
      }
    },
    showNew() {
      // this.valid = false
      this.category = { ...this.initCategory }
      this.dialog = true
    },
    showEdit(i: number) {
      this.valid = true
      const categ = this.categories[i]
      this.category = { ...categ }
      ;(this.category as any).id = categ.id
      this.dialog = true
    },
    getCategRatioColor(categ: any) {
      const ratio = categ.balance / (categ.budget * this.weeksCount)
      return [ratio < 0.5 ? 'green' : ratio <= 0.75 ? 'orange' : 'red', ratio]
    },
  },
})
</script>
<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
