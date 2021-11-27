import type { MutationTree } from 'vuex'
import type firebase from 'firebase'
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
    state.firstdoc = undefined
    state.lastdoc = undefined
    state.items = 5
  },
  /**
   * Set the first fetched operation
   *
   * @param state The state
   * @param doc The operation
   */
  FIRST_DOC: (state, doc?: firebase.firestore.DocumentSnapshot) => {
    state.firstdoc = doc
  },
  /**
   * Set the last fetched operation
   *
   * @param state The state
   * @param doc The operation
   */
  LAST_DOC: (state, doc?: firebase.firestore.DocumentSnapshot) => {
    state.lastdoc = doc
  },
}

export default mutations
