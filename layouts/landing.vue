<template>
  <v-app dark>
    <v-btn
      class="d-lg-none"
      style="bottom: 45px"
      fab
      small
      fixed
      bottom
      left
      @click="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" fixed app>
      <NavList />
    </v-navigation-drawer>
    <v-main>
      <Nuxt />
    </v-main>
    <v-footer fixed app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
  }),
  computed: {
    miniVariant() {
      switch (this.$vuetify.breakpoint.name) {
        case 'lg':
        case 'xl':
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.drawer = true
          return true
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.drawer = false
      return false
    },
  },
}
</script>
