<template>
  <v-list class="fill-height d-flex flex-column">
    <v-list-item
      v-for="(item, i) in items.filter((l) => !l.bottom)"
      :key="i"
      :to="item.to"
      router
      exact
      style="flex: 0"
      :class="item.order && `order-${item.order}`"
      :disabled="item.disabled"
      :title="item.title"
    >
      <v-list-item-action>
        <v-icon :disabled="item.disabled">{{ item.icon }}</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title v-text="item.title" />
      </v-list-item-content>
    </v-list-item>
    <v-list-item
      v-for="(item, i) in items.filter((l) => l.bottom)"
      :key="100 + i"
      :to="item.to"
      router
      exact
      style="flex: 0"
      :class="[item.order && `order-${item.order}`, i === 0 && 'mt-auto']"
      :disabled="item.disabled"
      :title="item.title"
    >
      <v-list-item-action>
        <v-icon :disabled="item.disabled">{{ item.icon }}</v-icon>
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
      const routes = [
        {
          icon: 'mdi-help-circle',
          title: 'A propos',
          to: '/about',
          disabled: true,
          bottom: true,
        },
      ]
      if (isLoggedIn) {
        // Logged in routes
        return [
          ...routes,
          {
            icon: 'mdi-view-dashboard',
            title: 'Tableau de bord',
            to: '/dashboard',
          },
          {
            icon: 'mdi-calendar',
            title: 'Planificateur',
            to: '/agenda',
          },
          {
            icon: 'mdi-chart-box-outline',
            title: 'Statistiques',
            to: '/stats',
            disabled: true,
          },
          {
            icon: 'mdi-cog',
            title: 'Paramètres',
            to: '/settings',
            bottom: true,
            order: 3,
          },
          {
            icon: 'mdi-logout',
            title: 'Déconnexion',
            to: '/logout',
            bottom: true,
            order: 4,
          },
        ]
      }
      // Default routes
      return [
        ...routes,
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
