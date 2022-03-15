import type { MutationTree } from 'vuex'
import type { OperationState } from './state'

/**
 * Mutations for user's operations
 */
const mutations: MutationTree<OperationState> = {
  /**
   * Reset state
   *
   * @param state The state
   */
  RESET_STATE: (state) => {
    state.data = []
    state.loading = false
  },
  /**
   * Reset loading state
   *
   * @param state The state
   */
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
}

export default mutations
