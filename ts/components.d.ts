/**
 * Vuetify VForm public methods
 *
 * @see https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VForm/VForm.ts
 */
export type VForm = Vue & {
  resetValidation(): void
  validate(): boolean
  reset(): void
  resetValidation(): void
}

/**
 * Vuetify VMenu public methods
 *
 * @see https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/components/VMenu/VMenu.ts
 */
export type VMenu = Vue & {
  save(data: any): any
}
