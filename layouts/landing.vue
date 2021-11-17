<template>
  <v-app dark>
    <v-btn
      class="d-lg-none"
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
    <v-footer absolute app>
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
      this.$toast.global.info(this.$vuetify.breakpoint.name)
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
        case 'md':
          this.drawer = false
          return false
        case 'lg':
        case 'xl':
          this.drawer = true
          return true
      }
    },
  },
}
</script>
