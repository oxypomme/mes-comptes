<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-form>
          <v-toolbar elevation="0" dense>
            <v-toolbar-title> Choisir une icone </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon small plain @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text>
            <v-container>
              <v-row>
                <v-form class="search-form" @submit="onSearch">
                  <v-text-field
                    v-model="search"
                    label="Nom de l'icone"
                    required
                    :dense="$device.isMobile"
                  >
                  </v-text-field>
                  <v-btn
                    type="submit"
                    class="ml-2"
                    color="primary"
                    v-bind="attrs"
                    :disabled="isLoading"
                    v-on="on"
                  >
                    <v-icon> mdi-magnify </v-icon>
                  </v-btn>
                </v-form>
              </v-row>
              <v-row class="mb-1">
                <v-tabs v-model="type" @change="onTabChange">
                  <v-tab v-for="(name, i) in types" :key="i">{{ name }}</v-tab>
                </v-tabs>
              </v-row>
              <v-row v-if="!isLoading">
                <v-tooltip v-for="(icon, i) in icons" :key="i" top>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      text
                      icon
                      v-on="on"
                      @click="onIconClick(icon)"
                    >
                      <v-icon> mdi-{{ icon }} </v-icon>
                    </v-btn>
                  </template>
                  <span>{{ icon }}</span>
                </v-tooltip>
              </v-row>
              <v-row v-else>
                <v-skeleton-loader
                  v-for="i in 65"
                  :key="i"
                  height="28"
                  width="28"
                  type="image"
                  class="ma-1"
                ></v-skeleton-loader>
              </v-row>
              <v-row justify="center">
                <v-pagination
                  v-model="page"
                  circle
                  :disabled="isLoading"
                  :length="maxPage"
                  total-visible="5"
                ></v-pagination>
              </v-row>
            </v-container>
          </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
    <v-btn text icon @click="dialog = true">
      <v-icon>{{ value }}</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type APIIcon = {
  aliases: string[]
  commentCount: number
  data: string
  id: string
  name: string
  user: { id: string; name: string }
}

const API_LIMIT = 65

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isLoading: false,
    dialog: false,
    icons: [] as string[],
    type: 0,
    types: ['filled', 'outline'],
    search: '',
    maxPage: 0,
    page: 1,
  }),
  watch: {
    page() {
      this.getIcons()
    },
  },
  mounted() {
    this.getIcons()
  },
  methods: {
    /**
     * Handler when an icon is choosen
     *
     * @param icon The icon name
     */
    onIconClick(icon: string) {
      this.dialog = false
      this.$emit('input', `mdi-${icon}`)
    },
    onSearch(e: Event) {
      e.preventDefault()
      e.stopPropagation()
      this.page = 1
      this.getIcons()
    },
    onTabChange() {
      this.page = 1
      this.getIcons()
    },
    /**
     * Get icons from MDI
     */
    async getIcons() {
      if (!this.isLoading) {
        this.isLoading = true

        const offset = API_LIMIT * (this.page - 1)
        const { data, total } = await (
          await fetch(
            'https://oxypomme.fr/mdi/icons/?' +
              new URLSearchParams({
                limit: API_LIMIT.toString(),
                search: this.search,
                type: this.types[this.type],
                offset: offset.toString(),
              })
          )
        ).json()

        this.icons = (data as APIIcon[]).map(({ name }) => name)
        this.maxPage = Math.ceil(total / API_LIMIT)

        this.isLoading = false
      }
    },
  },
})
</script>

<style scoped>
.search-form {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
