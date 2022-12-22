<template>
  <v-dialog v-model="show" width="500">
    <v-card>
      <v-form v-model="valid" @submit="save">
        <v-toolbar elevation="0" dense>
          <v-toolbar-title> Détails de {{ editedValue.name }} </v-toolbar-title>
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
                  v-model="editedValue.currency"
                  :items="currencies"
                  :rules="rules.currency"
                  label="Devise"
                  item-value="0"
                  item-text="1"
                ></v-select>
              </v-col>
              <v-col>
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  min-width="auto"
                >
                  <template #activator="{ on, attrs }">
                    <v-text-field
                      v-model="formatedDate"
                      label="Date de prélèvement"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dateValue"
                    :min="minDate"
                    :max="maxDate"
                    color="primary"
                    locale="fr-FR"
                    :first-day-of-week="1"
                    :events="rowDates"
                    event-color="primary"
                    show-current
                    show-adjacent-months
                    @change="saveDate"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="editedValue.account"
                  :items="accounts"
                  :rules="rules.account"
                  persistent-hint
                  required
                  label="Compte"
                  hint="Compte dans lequel sera créé automatiquement l'opération"
                  item-value="id"
                  item-text="name"
                  @change="onAccountChange"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="d-flex">
                  <v-icon
                    class="mr-2"
                    :color="categ.type === 2 ? 'green' : 'red'"
                    style="min-width: 24px"
                  >
                    {{ categ.icon }}
                  </v-icon>
                  <v-select
                    v-model="editedValue.category"
                    :items="categories"
                    :disabled="!editedValue.account"
                    :rules="rules.category"
                    persistent-hint
                    required
                    label="Catégorie"
                    hint="Catégorie dans laquelle sera créé automatiquement l'opération"
                    item-value="id"
                    item-text="name"
                  ></v-select>
                </div>
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
import type {
  Account,
  AgendaRow,
  Category,
  InputAgendaRow,
  Settings,
} from '~/ts/types'
import type { VForm } from '~/ts/components'
import dayjs from '~/ts/dayjs'
import { ECategoryType } from '~/ts/ECategoryType'
import { currencies } from '~/ts/currency'

export default Vue.extend({
  props: {
    /**
     * If val is `undefined`, a new operation is requested
     * If val is `null`, we don't want to show the component
     */
    value: {
      type: Object as PropType<AgendaRow | undefined | null>,
      required: false,
      default: null,
    },
  },
  data: () => ({
    valid: false,
    menu: false,
    initValue: {
      id: undefined,
      status: true,
      name: '',
      category: '',
      account: '',
      currency: 'EUR',
      modifier: 1,
      values: [],
      date: dayjs(),
    } as InputAgendaRow,
    editedValue: {} as InputAgendaRow,
    rules: {
      account: [(v) => !!v || 'Un compte est requis'],
      category: [(v) => !!v || 'Une catégoie est requise'],
      currency: [
        (v) =>
          !v ||
          Object.keys(currencies).includes(v) ||
          "La devise n'est pas reconnue",
      ],
    } as Record<string, ((v: string) => true | string)[]>,
    currencies: Object.entries(currencies),
  }),
  computed: {
    ...mapGetters({
      loading: 'agenda/getLoadingState',
      accounts: 'account/getAccounts',
    }),
    /**
     * Dialog toggle
     */
    show: {
      get(): boolean {
        return this.value !== null
      },
      set(newValue: boolean) {
        this.$emit('input', newValue ? this.editedValue : null)
      },
    },
    categories(): Category[] {
      const cats: Category[] = this.$store.getters['categories/getCategories']
      return cats.filter(({ type }) =>
        this.editedValue.modifier === 1
          ? type === ECategoryType.PLANNED_CREDIT
          : type !== ECategoryType.PLANNED_CREDIT
      )
    },
    categ(): Category | {} {
      const category = (this.categories as Category[]).find(
        ({ id }) => id === this.editedValue.category
      )
      return category || {}
    },
    /**
     * Current row dates
     */
    rowDates(): string[] {
      return (this.$store.getters['agenda/getAgenda'] as AgendaRow[])
        .filter(({ date, id }) => date && id !== this.editedValue.id)
        .map(({ date }) => date && dayjs(date.toDate()).format('YYYY-MM-DD'))
    },
    /**
     * The value for DatePicker
     */
    dateValue: {
      get(): string {
        return this.editedValue.date?.format('YYYY-MM-DD')
      },
      set(value: string) {
        this.editedValue.date = dayjs(value, 'YYYY-MM-DD')
      },
    },
    formatedDate(): string {
      return this.editedValue.date?.format('DD/MM/YYYY')
    },
    /**
     * Minimal date for Date picker
     */
    minDate(): string {
      const settings = this.$store.getters.getSettings as Settings
      return dayjs(settings?.resetDate.toDate() ?? undefined)
        .startOf('month')
        .format('YYYY-MM-DD')
    },
    /**
     * Maxmimal date for Date picker
     */
    maxDate(): string {
      return dayjs(this.minDate).endOf('month').format('YYYY-MM-DD')
    },
  },
  watch: {
    /**
     * Reset edited operation
     */
    value(val) {
      this.editedValue = val ?? { ...this.initValue }

      if (!this.editedValue.currency) {
        this.editedValue.currency = 'EUR'
      }

      if (this.editedValue.account) {
        this.onAccountChange()
      }
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
     * Triggered when account is changed
     */
    onAccountChange() {
      const index = (this.accounts as Account[]).findIndex(
        ({ id }) => id === this.editedValue.account
      )
      if (index >= 0) {
        this.$store.dispatch('account/selectAccount', index).then(() => {
          const index = (this.categories as Category[]).findIndex(
            ({ id }) => id === this.editedValue.category
          )
          if (index < 0) {
            let t = ECategoryType.PLANNED_DEBIT
            if (this.editedValue.modifier > 0) {
              t = ECategoryType.PLANNED_CREDIT
            }

            const categ = (this.categories as Category[]).find(
              ({ type }) => type === t
            )
            this.editedValue.category = categ?.id ?? ''
          }
        })
      }
    },
    /**
     * Edit a value in a row from the agenda
     *
     * @param e The event
     */
    async save(e: Event) {
      e.preventDefault()

      try {
        await this.$store.dispatch('agenda/updateDetail', this.editedValue)
      } catch (e) {
        this.$toast.global.error((e as Error).message)
      }

      this.$emit('input', null)
    },
    saveDate(date: string) {
      ;(this.$refs.menu as Element & { save: (data: any) => any }).save(date)
    },
  },
})
</script>
