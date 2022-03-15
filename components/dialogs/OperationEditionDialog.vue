<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form v-model="valid" @submit="createOperation">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title>
            {{ operation.id ? 'Editer' : 'Créer' }} une opération
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
                  v-model="operation.name"
                  label="Nom"
                  required
                  :dense="$device.isMobile"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="operation.modifier"
                  :items="[
                    { name: 'Crédit +', modifier: 1 },
                    { name: 'Débit -', modifier: -1 },
                  ]"
                  item-text="name"
                  item-value="modifier"
                  required
                  :dense="$device.isMobile"
                  label="Type"
                ></v-select>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="operation.amount"
                  label="Montant"
                  type="number"
                  prefix="€"
                  :dense="$device.isMobile"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="operation.category"
                  :items="selectCategories"
                  item-text="name"
                  item-value="id"
                  label="Catégorie"
                  :dense="$device.isMobile"
                ></v-select>
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
import { ECategoryType } from '~/ts/ECategoryType'
import type { ValueModifier, InputOperation, Category } from '~/ts/types'

export default Vue.extend({
  props: {
    // eslint-disable-next-line vue/require-prop-types
    value: {
      required: true,
    },
  },
  data: () => ({
    show: false,
    valid: true,

    initOperation: {
      name: '',
      amount: '',
      category: null,
      modifier: -1 as ValueModifier,
    },
    operation: {} as InputOperation,
  }),
  computed: {
    ...mapGetters({
      loading: 'operations/getLoadingState',
    }),
    /**
     * Options for select categories
     */
    selectCategories(): Category[] {
      const categs = this.$store.getters['categories/getCategories']
      return [
        {
          id: null,
          name: '',
          balance: 0,
          budget: 0,
          type: ECategoryType.BUDGET,
        },
        ...categs,
      ]
    },
  },
  watch: {
    /**
     * If val is `undefined`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    value(val) {
      this.operation = val ?? { ...this.initOperation }
      this.show = val !== null
    },
  },
  methods: {
    /**
     * Create an operation
     */
    async createOperation(e: Event) {
      e.preventDefault()
      if (this.valid) {
        try {
          if (this.operation.id) {
            await this.$store.dispatch('operations/editOperation', {
              ...this.operation,
            })
            this.$toast.global.success('Opération editée')
          } else {
            await this.$store.dispatch(
              'operations/createOperation',
              this.operation
            )
          }
        } catch (e) {
          this.$toast.global.error((e as Error).message)
        }
        this.$emit('input', null)
      }
    },
  },
})
</script>
