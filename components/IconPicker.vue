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
                <v-text-field
                  v-model="search"
                  label="Nom de l'icone"
                  required
                  :dense="$device.isMobile"
                  @keydown.passive="getIcons"
                >
                </v-text-field>
              </v-row>
              <v-row v-if="!isLoading">
                <v-btn
                  v-for="(icon, i) in icons"
                  :key="i"
                  text
                  icon
                  @click="onIconClick(icon)"
                >
                  <!-- TODO: Tooltip -->
                  <v-icon> mdi-{{ icon }} </v-icon>
                </v-btn>
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
import { debounce } from 'lodash'

type APIIcon = {
  aliases: string[]
  commentCount: number
  data: string
  id: string
  name: string
  user: { id: string; name: string }
}

const fetchIcons = debounce(async function (
  search: string,
  type: string,
  cb: (data: APIIcon[]) => void
) {
  const { data } = await (
    await fetch(
      `https://oxypomme.fr/mdi/icons/?limit=65&select=name&search=${search}&type=${type}`
    )
  ).json()
  cb(data)
},
500)

export default Vue.extend({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isLoading: true,
    dialog: false,
    icons: [] as string[],
    type: '',
    types: ['', 'outline'],
    search: '',
  }),
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
    /**
     * Get icons from MDI
     */
    getIcons() {
      fetchIcons(this.search, this.type, (data) => {
        this.icons = data.map(({ name }) => name)
        this.isLoading = false
      })
    },
  },
})
</script>
