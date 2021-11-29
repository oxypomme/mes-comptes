import type { GetterTree } from 'vuex'
import type { RootState } from './state'

/**
 * Getters for root state
 */
const getters: GetterTree<RootState, RootState> = {
  /**
   * Get the user's settings
   *
   * @param state The state
   * @returns The settings
   */
  getSettings: (state) => state.settings,
  /**
   * Get the toolbar title
   *
   * @param state The state
   * @returns The title
   */
  getTitle: (state) => state.title,
}

export default getters
