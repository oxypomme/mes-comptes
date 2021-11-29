import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { AuthState } from './state'

/**
 * Getters for user
 */
const getters: GetterTree<AuthState, RootState> = {
  /**
   * Get the authed user
   *
   * @param state The state
   * @returns The user
   */
  getUser: (state) => state.user,
}

export default getters
