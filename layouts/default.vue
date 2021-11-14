<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" fixed app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app>
      <v-app-bar-nav-icon @click="openDrawer" />
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
      drawer: true,
      miniVariant: true,
      title: 'Mes Comptes',
    }
  },
  computed: {
    items() {
      const isLoggedIn = !!this.$store.getters['auth/getUser']
      if (isLoggedIn) {
        // Logged in routes
        return [
          {
            icon: 'mdi-view-dashboard',
            title: 'Tableau de bord',
            to: '/dashboard',
          },
          {
            icon: 'mdi-logout',
            title: 'Déconnexion',
            to: '/logout',
          },
        ]
      }
      // Default routes
      return [
        {
          icon: 'mdi-login',
          title: 'Connexion',
          to: '/login',
        },
      ]
    },
  },
  methods: {
    openDrawer() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
        case 'sm':
        case 'md':
          this.drawer = !this.drawer
          this.miniVariant = false
          break
        case 'lg':
        case 'xl':
          this.drawer = true
          this.miniVariant = !this.miniVariant
          break
      }
    },
  },
}
</script>
