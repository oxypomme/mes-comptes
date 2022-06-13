<template>
  <div>
    <v-parallax :src="images.cover" height="750" class="header-bg">
      <v-container justify="center">
        <v-row justify="center" class="text-center">
          <v-col cols="12" lg="7">
            <v-row align="center">
              <v-col order="1" order-sm="2">
                <h1 class="display-2 font-weight-bold">Mes Comptes</h1>
                <div class="d-none d-sm-block mt-4">
                  <h4 class="font-weight-light">
                    Surveillez vos économies de façon simple et efficace
                  </h4>
                  <v-btn
                    x-large
                    color="primary mt-4"
                    @click="$vuetify.goTo('#pricing')"
                  >
                    Voir les tarifs
                  </v-btn>
                </div>
              </v-col>
              <v-col order="2" order-sm="1">
                <v-img :src="images.presentation" max-height="375" contain>
                  <template #placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="grey lighten-5"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-col>
              <v-col order="3" class="d-sm-none pb-5">
                <h4 class="font-weight-light">
                  Surveillez vos économies de façon simple et efficace
                </h4>
                <v-btn to="login" large rounded color="primary mt-4">
                  S'inscrire
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-parallax>
    <v-spacer class="py-4" />
    <v-container>
      <v-row justify="center" class="my-4">
        <v-col cols="12" lg="9" xl="7">
          <v-row v-for="(item, i) in features" :key="i" align="center">
            <v-col :order-sm="i % 2">
              <v-img :src="item.image" width="400" height="300" contain>
                <template #placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="grey lighten-5"
                    ></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </v-col>
            <v-col :order-sm="1 - (i % 2)" :class="[i % 2 && 'text-right']">
              <h3>{{ item.name }}</h3>
              {{ item.desc }}
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row id="pricing" justify="center" class="mt-8 mb-2">
        <v-col cols="12" lg="9" xl="7">
          <v-row justify="center">
            <h2 class="display-2">Tarification</h2>
          </v-row>
          <v-row justify="center">
            <v-col v-for="(item, i) in pricing" :key="i">
              <v-hover v-slot="{ hover }">
                <v-card
                  class="mx-auto fill-height"
                  :elevation="hover ? 12 : 1"
                  max-width="350"
                >
                  <v-img width="350" height="150" :src="item.image" contain>
                    <template #placeholder>
                      <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                      >
                        <v-progress-circular
                          indeterminate
                          color="grey lighten-5"
                        ></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>
                  <v-card-text class="my-4 text-center">
                    <span class="text-overline">{{ item.name }}</span>
                    <v-list v-for="(feat, j) in item.features" :key="j" dense>
                      <v-list-item>
                        <v-list-item-icon>
                          <span v-if="feat.max">{{ feat.max }}</span>
                          <v-icon v-else-if="feat.status === false" color="red">
                            mdi-close-thick
                          </v-icon>
                          <v-icon v-else color="green">mdi-check-bold</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ feat.name }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-divider />
                    <div class="mt-5">
                      <span v-if="item.price > 0">
                        <span class="text-h4">{{ item.price }}</span>
                        € / mois
                      </span>
                      <span v-else class="text-h4">Gratuit</span>
                    </div>
                    <v-btn
                      v-if="item.price === 0"
                      to="login"
                      large
                      rounded
                      class="mt-4"
                      color="primary"
                    >
                      S'inscrire
                    </v-btn>
                    <v-btn
                      v-else
                      to=""
                      class="mt-4"
                      large
                      rounded
                      color="primary"
                      :disabled="item.price !== 0"
                    >
                      S'abonner
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  layout: 'landing',
  data: () => ({
    images: {
      cover: 'banner.webp',
      presentation: 'logo.webp',
    },
    features: [
      {
        image: 'accounts.webp',
        name: 'Plusieurs comptes, en un seul',
        desc: `Créez des sous comptes vrituels de façon dynamique pour pouvoir répartir vos économies.`,
      },
      {
        image: 'categories.webp',
        name: 'Catégorisez vos dépenses',
        desc: `Divisez vos dépenses et/ou revenus dans divers budgets, avec ou sans plafond.`,
      },
      {
        image: 'agenda.webp',
        name: 'Prévoyez vos budgets',
        desc: `Prévoyez vos dépenses récurrentes et vos revenus pour définir des plafond dynamiques.`,
      },
      {
        image: 'iphone.webp',
        name: 'Avec vous, partout',
        desc: `Pensée pour une utilisation nomade, l'application est disponible pour votre mobile.`,
      },
    ],
    pricing: [
      {
        name: 'Starter',
        price: 0,
        icon: 'rocket',
        image: 'macos.webp',
        features: [
          {
            name: 'Comptes secondaires',
          },
          {
            name: 'Catégories personalisées',
          },
          {
            name: 'Planning',
          },
          {
            name: 'Application Mobile',
          },
        ],
      },
      {
        name: 'Dummy',
        price: 0.99,
        icon: 'rocket',
        image: 'win.webp',
        features: [
          {
            name: 'Dummy',
          },
          {
            name: 'Dummy',
            status: false,
          },
          {
            name: 'Dummy',
            status: false,
          },
          {
            name: 'Dummy',
            status: false,
          },
        ],
      },
    ],
  }),
  mounted() {
    // Check if connected
    if (this.$store.getters['auth/getUser']) {
      this.$router.push('/dashboard')
    }

    const images = this.images
    for (const [k, value] of Object.entries(images)) {
      const key = k as keyof typeof images
      this.images[key] = ''
      this.fetchImg(value).then((url) => {
        this.images[key] = url
      })
    }
    for (const item of [...this.features, ...this.pricing]) {
      if (item.image) {
        const image = item.image
        item.image = ''
        this.fetchImg(image).then((url) => {
          item.image = url
        })
      }
    }
  },
  methods: {
    fetchImg(name: string): Promise<string> {
      try {
        return this.$fire.storage.ref(`/landing/${name}`).getDownloadURL()
      } catch (e: any) {
        return Promise.resolve(name)
      }
    },
  },
})
</script>
