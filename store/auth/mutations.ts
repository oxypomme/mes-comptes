import type { MutationTree } from 'vuex'
import type firebase from 'firebase'
import type { AuthState } from './state'

/**
 * Mutations for user
 */
const mutations: MutationTree<AuthState> = {
  /**
   * Set the current user
   *
   * @param state The state
   * @param user The user
   */
  SET_AUTH_USER: (state, { uid, email, emailVerified }: firebase.User) => {
    if (email) {
      state.user = { uid, email, emailVerified }
    } else {
      state.user = null
    }
  },
  /**
   * Reset state
   *
   * @param state The state
   */
  RESET_STATE: (state) => {
    state.user = null
  },
}

export default mutations
