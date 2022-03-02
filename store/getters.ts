import type { GetterTree } from 'vuex'
import type { RootState } from './state'

/**
 * Getters for root state
 */
const getters: GetterTree<RootState, RootState> = {
  /**
   * Get the user's settings
   *
   * @param state The state
   * @returns The settings
   */
  getSettings: (state) => state.settings,
  /**
   * Get the toolbar title
   *
   * @param state The state
   * @returns The title
   */
  getTitle: (state) => state.title,
  /**
   * Number of weeks in current month
   */
  getWeekCount: (state) => {
    let resetDate = new Date()
    if (state.settings.resetDate) {
      resetDate = state.settings.resetDate.toDate()
    } else {
      resetDate.setMonth(resetDate.getMonth() + 1)
    }
    const prevResetDate = new Date(resetDate)
    prevResetDate.setMonth(prevResetDate.getMonth() - 1)

    const count = Math.round(
      // W * D * m * s * ms
      (resetDate.getTime() - prevResetDate.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )

    return count
  },
}

export default getters
