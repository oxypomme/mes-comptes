import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { OperationState } from './state'

/**
 * Getters for user's operations
 */
const getters: GetterTree<OperationState, RootState> = {
  /**
   * Get the operations for the auther user in the selected account
   *
   * @param state The state
   * @returns The operation
   */
  getOperations: (state) => state,
}

export default getters
