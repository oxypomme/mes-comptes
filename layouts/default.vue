<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="showDrawer"
      :mini-variant="isMdOrLess() ? drawer : false"
      fixed
      app
    >
      <NavList />
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer fixed app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: this.isMdOrLess(),
    }
  },
  computed: {
    showDrawer: {
      get() {
        return this.isMdOrLess() ? true : this.drawer
      },
      set(newVal) {
        this.drawer = newVal
      },
    },
    title() {
      return this.$store.getters.getTitle
    },
  },
  created() {
    // init appCheck
    // this.$fire.check.activate('6LeEbEgdAAAAAKAcmOeVYPdQ1uV91lzHfQtYXzpI')
  },
  methods: {
    isMdOrLess() {
      switch (this.$vuetify.breakpoint.name) {
        case 'lg':
        case 'xl':
          return true
      }
      return false
    },
  },
}
</script>
<style lang="scss">
.vueToast {
  font-family: 'Roboto', sans-serif;
}
</style>
