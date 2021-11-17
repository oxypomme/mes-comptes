<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="showDrawer"
      :mini-variant="this.isMdOrLess() ? this.drawer : false"
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
    <v-footer absolute app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: this.isMdOrLess(),
      title: 'Mes Comptes',
    }
  },
  computed: {
    showDrawer: {
      get: function () {
        return this.isMdOrLess() ? true : this.drawer
      },
      set: function (newVal) {
        this.drawer = newVal
      },
    },
  },
  methods: {
    isMdOrLess() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
        case 'md':
          return false
        case 'lg':
        case 'xl':
          return true
      }
    },
  },
}
</script>
<style lang="scss">
.vueToast {
  font-family: 'Roboto', sans-serif;
}
</style>
