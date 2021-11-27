import type { MutationTree } from 'vuex'
import type { CategoryState } from './state'

/**
 * Mutations for user's categories
 */
const mutations: MutationTree<CategoryState> = {
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
