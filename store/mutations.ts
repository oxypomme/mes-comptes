import type { MutationTree } from 'vuex'
import { vuexfireMutations } from 'vuexfire'
import type { RootState } from './state'

/**
 * Mutation for root state
 */
const mutations: MutationTree<RootState> = {
  ...vuexfireMutations,
  /**
   * Reset user's settings
   *
   * @param state The state
   */
  RESET_SETTINGS_STATE: (state) => {
    state.settings = {}
  },
  /**
   * Replace the toolbar title
   *
   * @param state The state
   * @param title The new title
   */
  SET_TITLE: (state, title) => {
    state.title = title
  },
}

export default mutations
