import type { MutationTree } from 'vuex'
import type firebase from 'firebase'
import type { AuthState } from './state'

const mutations: MutationTree<AuthState> = {
  SET_AUTH_USER: (state, { uid, email, emailVerified }: firebase.User) => {
    if (email) {
      state.user = { uid, email, emailVerified }
    } else {
      state.user = null
    }
  },
  RESET_STATE: (state) => {
    state.user = null
  },
}

export default mutations
