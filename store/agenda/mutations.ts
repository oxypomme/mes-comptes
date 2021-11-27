import type { MutationTree } from 'vuex'
import type { AgendaState } from './state'

/**
 * Mutations for user's agenda
 */
const mutations: MutationTree<AgendaState> = {
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
