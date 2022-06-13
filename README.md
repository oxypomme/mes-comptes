# mes-comptes

[![screenshot](https://firebasestorage.googleapis.com/v0/b/comptes-oxy.appspot.com/o/landing%2Fbanner_logo.webp?alt=media&token=1edde85f-b8a9-4c3c-a06c-c10440363a0b)](https://comptes-oxy.web.app/)

> Only available in French for now, sorry guys.

Application simple pensée pour le grand public permettant de gérer ses économies via une interface rapide et réactive.

Fonctionnalités principales :

- :heavy_check_mark: **Gratuit et open-source**
- :heavy_check_mark: Sous-comptes virtuels : Créez des sous comptes de façon dynamique pour pouvoir répartir vos économies
- :heavy_check_mark: Catégories : Divisez vos dépenses et/ou revenus dans divers budgets, avec ou sans plafond
- :heavy_check_mark: Agenda : Prévoyez vos dépenses récurrentes et vos revenus pour définir des plafond dynamiques
- :heavy_check_mark: Mobilité : Pensée pour une utilisation nomade, l'application est disponible sur mobile. Pour l'installer il suffit d'aller sur le site.

Fonctionnalités possibles :

- :x: Meilleur logo et bannière, parce que là c'est juste le logo de Nuxt et un screen :neutral_face:
- :x: Opérations ajoutées automatiquement selon les données définies dans l'agenda, ou au moins des notifications
- :x: Notifications lorsque un budget atteint un stade critique
- :x: Statistiques, parce que :chart_with_upwards_trend: **stonks**
- :x: Support d'autres langues

Intéressé ? [Aller jetez un oeil](https://comptes-oxy.web.app/), c'est gratuit.

## Dev notes

### Dependencies

- typescript
- nuxt (vue2 + vuex + pwa)
- vuetify
- firebase (vuexfire, cloud functions)

### Development

```sh
yarn # Install dependencies
yarn develop # Server with hot reload
```

For more information about Special Directories, see `README.nuxt.md`.

#### Recommended setup

- vscode
- eslint
- prettier
- vetur
- stylelint
- conventional commits

### Build for production

```sh
yarn # Install dependencies
yarn build # Build project
yarn start # Run production-ready server
```
