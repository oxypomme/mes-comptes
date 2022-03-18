import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { AccountState } from './state'

/**
 * Getters for user's accounts
 */
const getters: GetterTree<AccountState, RootState> = {
  /**
   * Get the user's accounts
   *
   * @param state The state
   * @returns The accounts
   */
  getAccounts: (state) => state.accounts,
  /**
   * Get the user's selected account
   *
   * @param state The state
   * @returns The account
   */
  getCurrent: (state) => state.current,
  /**
   * Get the loading state
   *
   * @param state The state
   * @returns The loading state
   */
  getLoadingState: (state) => state.loading,
}

export default getters
