import type { MutationTree } from 'vuex'
import type { AccountState } from './state'

/**
 * Mutations for user's accounts
 */
const mutations: MutationTree<AccountState> = {
  /**
   * Reset state
   *
   * @param state The state
   */
  RESET_STATE: (state) => {
    state.accounts = []
    state.current = null
  },
}

export default mutations
