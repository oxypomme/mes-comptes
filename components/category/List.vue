<template>
  <div>
    <CategoryDialogEdition v-model="category" />
    <v-card>
      <v-card-title>
        <span class="font-weight-light">Catégories</span>
        <span class="last-item">
          <v-tooltip v-if="parseInt(roulement) > -1" top>
            <template #activator="{ on, attrs }">
              <v-chip
                v-bind="attrs"
                :small="$vuetify.breakpoint.smAndDown"
                v-on="on"
              >
                {{ roulement }}
              </v-chip>
            </template>
            <span> Roulement </span>
          </v-tooltip>
          <v-btn
            class="last-item"
            icon
            color="success"
            @click="category = false"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </span>
      </v-card-title>
      <v-divider />
      <v-list :dense="$vuetify.breakpoint.smAndDown">
        <v-list-item-group>
          <v-list-item v-for="(categ, i) in categories" :key="i">
            <v-icon
              small
              class="mr-2"
              :color="categ.type === 2 ? 'green' : 'red'"
            >
              {{ categ.icon }}
            </v-icon>
            <v-list-item-content>
              <v-list-item-title v-text="categ.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-tooltip top>
                <template #activator="{ on, attrs }">
                  <v-chip
                    :color="categ.computed.ratio.color"
                    v-bind="attrs"
                    :small="$vuetify.breakpoint.smAndDown"
                    v-on="on"
                  >
                    {{ categ.computed.usage }}
                  </v-chip>
                </template>
                <span>
                  {{ categ.computed.tooltip }}
                </span>
              </v-tooltip>

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
import { escapeHTML } from '~/ts/format'
import type { InputCategory } from '~/ts/types'

export default Vue.extend({
  data: () => ({
    category: null as InputCategory | null,
  }),
  computed: {
    ...mapGetters({
      loading: 'categories/getLoadingState',
      categories: 'categories/getCategories',
      roulement: 'categories/getRoulement',
      weeksCount: 'getWeekCount',
    }),
  },
  methods: {
    /**
     * Delete category
     *
     * @param i The index in `this.categories`
     */
    async deleteCategory(i: number) {
      const res = await this.$dialog.confirm({
        text: `Voulez-vous supprimer la catégorie "${escapeHTML(
          this.categories[i].name
        )}" ?<br/>(cela ne supprimera pas les opérations liées)`,
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
            'categories/deleteCategory',
            this.categories[i].id
          )
          this.$toast.global.success('Catégorie supprimée')
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
      }
    },
    /**
     * Prepare popup for editing a category
     */
    showEdit(i: number) {
      const categ = this.categories[i]
      this.category = {
        ...categ,
        balance: categ.balance.toFixed(2),
        budget: (categ.budget / this.weeksCount).toFixed(2),
        id: categ.id,
      }
      // TODO: check if id usefull
    },
  },
})
</script>

<style lang="scss" scoped>
.last-item {
  margin-left: auto;
}
</style>
