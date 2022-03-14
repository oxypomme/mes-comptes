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
  },
}

export default mutations
