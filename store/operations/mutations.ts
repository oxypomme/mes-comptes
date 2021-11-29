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
    state.items = 15
    state.page = 1
    state.anchors = {
      firsts: {},
      lasts: {},
    }
  },
  /**
   * Keep a trace of operation that limit a page
   *
   * @param state The state
   * @param pagination The pagination data
   */
  SET_PAGE: (state, { page, fdoc, ldoc }) => {
    state.page = page
    if (fdoc) {
      state.anchors.firsts[page] = fdoc
    }
    if (ldoc) {
      state.anchors.lasts[page] = ldoc
    }
  },
}

export default mutations
