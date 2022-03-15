<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-toolbar elevation="0" dense>
        <v-toolbar-title> Afficher les opérations précédentes </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon color="grey" small plain @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col>
              <v-select
                v-model="selectedMonth"
                :items="availableMonths"
                return-object
                item-text="label"
                label="Mois"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'

export default Vue.extend({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    selectedMonth: { label: 'Courant (1 mois)' },
  }),
  computed: {
    ...mapGetters({
      availableMonths: 'getAvailableMonths',
    }),
    show: {
      get(): boolean {
        return this.value
      },
      set(newValue: boolean) {
        this.$emit('input', newValue)
      },
    },
  },
  watch: {
    selectedMonth(newValue) {
      this.show = false
      this.$store.dispatch(
        'operations/getOperations',
        {
          ...newValue,
        },
        { root: true }
      )
    },
  },
})
</script>
