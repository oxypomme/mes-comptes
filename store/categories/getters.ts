import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { CategoryState } from './state'

/**
 * Getters for user's categories
 */
const getter: GetterTree<CategoryState, RootState> = {
  /**
   * Get the categories of the authed user in the selected account
   *
   * @param state The state
   * @returns The categories
   */
  getCategories: (state) => state.data,
}

export default getter
