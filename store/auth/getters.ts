import type { GetterTree } from 'vuex'
import type { RootState } from '..'
import type { AuthState } from './state'

const getters: GetterTree<AuthState, RootState> = {
  getUser: (state) => state.user,
}

export default getters
