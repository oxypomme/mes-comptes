import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { OperationState } from './state'

/**
 * Getters for user's operations
 */
const getters: GetterTree<OperationState, RootState> = {
  /**
   * Get the operations for the auther user in the selected account.
   *
   * Mapping to ensure old data.
   *
   * @param state The state
   * @returns The operations
   */
  getOperations: (state) =>
    state.data.map((o) => ({
      ...o,
      id: o.id,
      date: o.date || o.createdAt,
    })),
  /**
   * Get the loading state
   *
   * @param state The state
   * @returns The loading state
   */
  getLoadingState: (state) => state.loading,
}

export default getters
