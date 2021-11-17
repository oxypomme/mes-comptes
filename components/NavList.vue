<template>
  <v-list>
    <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
      <v-list-item-action>
        <v-icon>{{ item.icon }}</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title v-text="item.title" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
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
}
</script>
