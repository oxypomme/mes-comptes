import type { SettingsState } from '~/types'

/**
 * Root state
 *
 * @returns The state
 */
const state = () => ({
  /**
   * User's settings
   */
  settings: {} as Partial<SettingsState>,
  /**
   * Toolbar title
   */
  title: 'Mes Comptes',
})

export default state

export type RootState = ReturnType<typeof state>
