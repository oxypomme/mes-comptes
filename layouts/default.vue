<template>
  <v-app>
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

<script lang="ts">
import Vue from 'vue'
import type { SettingsState } from '~/types'

export default Vue.extend({
  data() {
    return {
      drawer: (this as any).isMdOrLess(),
    }
  },
  computed: {
    showDrawer: {
      get(): boolean {
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
    // init theme
    this.$vuetify.theme.dark = !(
      this.$store.getters.getSettings as SettingsState
    ).lightTheme
  },
  methods: {
    isMdOrLess(): boolean {
      switch (this.$vuetify.breakpoint.name) {
        case 'lg':
        case 'xl':
          return true
      }
      return false
    },
  },
})
</script>
<style lang="scss">
.vueToast {
  font-family: 'Roboto', sans-serif;
}

.theme--light {
  & ::-webkit-scrollbar {
    width: 15px;

    &-track {
      background: #e6e6e6;
      border-left: 1px solid #dadada;
    }

    &-thumb {
      background: #b0b0b0;
      border: solid 3px #e6e6e6;
      border-radius: 7px;

      &:hover {
        background: black;
      }
    }
  }
}

.theme--dark {
  & ::-webkit-scrollbar {
    width: 15px;

    &-track {
      background: #202020;
      border-left: 1px solid #2c2c2c;
    }

    &-thumb {
      background: #3e3e3e;
      border: solid 3px #202020;
      border-radius: 7px;

      &:hover {
        background: white;
      }
    }
  }
}
</style>
