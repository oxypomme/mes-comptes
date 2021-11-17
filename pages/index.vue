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
                    Build your application today!
                  </h4>
                  <v-btn to="login" rounded color="primary mt-4">
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
      <v-row justify="center">
        <v-col cols="12" lg="9" xl="7">
          <v-row justify="center">
            <h2 class="display-2">Lorem Ipsum</h2>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-img
                src="https://picsum.photos/400/300"
                width="400"
                height="300"
              ></v-img>
            </v-col>
            <v-col>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              sit amet leo efficitur, maximus arcu et, pellentesque ante.
              Suspendisse vel massa id dolor varius laoreet. Curabitur aliquam
              lacus ex, in lacinia risus hendrerit a. Interdum et malesuada
              fames ac ante ipsum primis in faucibus.
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              sit amet leo efficitur, maximus arcu et, pellentesque ante.
              Suspendisse vel massa id dolor varius laoreet. Curabitur aliquam
              lacus ex, in lacinia risus hendrerit a. Interdum et malesuada
              fames ac ante ipsum primis in faucibus.
            </v-col>
            <v-col>
              <v-img
                src="https://picsum.photos/400/300?random=1"
                width="400"
                height="300"
              ></v-img>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <v-img
                src="https://picsum.photos/400/300?random=2"
                width="400"
                height="300"
              ></v-img>
            </v-col>
            <v-col>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
              sit amet leo efficitur, maximus arcu et, pellentesque ante.
              Suspendisse vel massa id dolor varius laoreet. Curabitur aliquam
              lacus ex, in lacinia risus hendrerit a. Interdum et malesuada
              fames ac ante ipsum primis in faucibus.
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row justify="center" class="mb-4">
        <v-col cols="12" lg="9" xl="7">
          <v-row justify="center">
            <h2 class="display-2">Lorem Ipsum</h2>
          </v-row>
          <v-row justify="center">
            <v-btn to="login" x-large rounded color="primary mt-4">
              S'inscrire
            </v-btn>
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
  mounted() {
    if (this.$store.getters['auth/getUser']) {
      this.$router.push('/dashboard')
    }
  },
})
</script>
