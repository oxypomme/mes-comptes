// @ts-ignore
import colors from 'vuetify/es5/util/colors'
import fireconfig from './firebase.json'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s Mes Comptes',
    title: '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  loading: '~/components/Loading.vue',

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/device',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/firebase',
    '@nuxtjs/toast',
    'vuetify-dialog/nuxt',
  ],

  ignore: ['functions/*', 'firebase/*'],

  toast: {
    position: 'top-center',
    iconPack: 'mdi',
    className: 'vueToast',
    register: [
      // Register custom toasts
      {
        name: 'show',
        message: (message: string) => message,
        options: {
          type: 'default',
          duration: 2000,
        },
      },
      {
        name: 'success',
        message: (message: string) => message,
        options: {
          type: 'success',
          icon: 'check',
          duration: 2000,
        },
      },
      {
        name: 'info',
        message: (message: string) => message,
        options: {
          type: 'info',
          icon: 'information-outline',
          duration: 2000,
        },
      },
      {
        name: 'error',
        message: (message: string) => message,
        options: {
          type: 'error',
          icon: 'alert-circle-outline',
          duration: 2000,
        },
      },
    ],
  },

  firebase: {
    config: fireconfig,
    services: {
      auth: {
        persistence: 'session',
        initialize: {
          onAuthStateChangedAction: 'auth/onAuth',
        },
      },
      firestore: {
        enablePersistence: {
          synchronizeTabs: true,
        },
      },
      performance: process.env.NODE_ENV === 'production',
      analytics: process.env.NODE_ENV === 'production',
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: 'Mes Comptes',
      short_name: 'Mes Comptes',
      start_url: '/login',
      lang: 'fr',
      background_color: '#121212',
    },
    meta: {
      description: 'Surveillez vos économies de façon simple et efficace',
      theme_color: '#1E1E1E',
      lang: 'fr',
      ogSiteName: 'comptes-oxy.web.app',
      ogTitle: 'Mes Comptes',
      ogHost: 'comptes-oxy.web.app',
      ogImage: 'https://picsum.photos/id/160/1700/950',
      ogUrl: 'https://comptes-oxy.web.app/',
      twitterCard: 'app',
      twitterSite: 'https://comptes-oxy.web.app/',
      tiwtterCreator: '@OxyT0m8',
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: 'https://fonts.gstatic.com/*',
          handler: 'staleWhileRevalidate',
        },
      ],
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    publicPath: '/nuxt/',
    extractCSS: true,
  },
}
