<template>
  <div>
    <v-parallax
      src="https://picsum.photos/id/160/1700/950"
      height="750"
      class="header-bg"
    >
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
                  <v-btn to="login" x-large rounded color="primary mt-4">
                    S'inscrire
                  </v-btn>
                </div>
              </v-col>
              <v-col order="2" order-sm="1">
                <v-img
                  src="https://preview.colorlib.com/theme/appy/images/xheader-mobile.png.pagespeed.ic.TC6bxBlXPg.webp"
                  max-height="375"
                  contain
                >
                </v-img>
              </v-col>
              <v-col order="3" class="d-sm-none pb-5">
                <h4 class="font-weight-light">Build your application today!</h4>
                <v-btn rounded color="primary mt-4"> S'inscrire </v-btn>
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
            <v-col :order="i % 2 === 0 ? 1 : 2">
              <v-img
                :src="item.image || 'https://picsum.photos/600/300?random=' + i"
                width="600"
                height="300"
              ></v-img>
            </v-col>
            <v-col :order="i % 2 === 0 ? 2 : 1">
              <h3>{{ item.name }}</h3>
              {{ item.desc }}
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center" class="mt-8 mb-2">
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
                  <v-img
                    height="150"
                    :src="
                      item.image ||
                      'https://picsum.photos/350/150?random=' + (i + 10)
                    "
                  ></v-img>
                  <v-card-text class="my-4 text-center">
                    <span class="text-overline">{{ item.name }}</span>
                    <v-list v-for="(feat, j) in item.features" :key="j" dense>
                      <v-list-item>
                        <v-list-item-icon>
                          <span v-if="feat.max">{{ feat.max }}</span>
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
    features: [
      {
        name: 'Plusieurs comptes, en un seul',
        desc: `Parler des sous-comptes pour représenter plusieurs comptes ou diviser son compte.`,
      },
      {
        name: 'Catégorisez vos dépenses',
        desc: `Un budget max par catégorie, catégories par sous-compte.`,
      },
      {
        name: 'Lorem ipsum',
        desc: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              sit amet leo efficitur, maximus arcu et, pellentesque ante.
              Suspendisse vel massa id dolor varius laoreet. Curabitur aliquam
              lacus ex, in lacinia risus hendrerit a. Interdum et malesuada
              fames ac ante ipsum primis in faucibus.`,
      },
    ],
    pricing: [
      {
        name: 'Starter',
        price: 0,
        icon: 'rocket',
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
        ],
      },
    ],
  }),
  mounted() {
    if (this.$store.getters['auth/getUser']) {
      this.$router.push('/dashboard')
    }
  },
})
</script>

<style lang="scss" scoped>
.price-hover .surprise {
  color: red;
}
</style>
