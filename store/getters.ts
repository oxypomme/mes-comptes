import type { GetterTree } from 'vuex'
import type { RootState } from './state'
import dayjs from '~/ts/dayjs'

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
  getAvailableMonths: (
    state
  ): { month?: number; year?: number; label: string }[] => {
    const today = dayjs()
    const months: { month: number; year: number; label: string }[] = []

    let date = dayjs(state.settings.createdAt?.toDate() ?? undefined)
    while (date.isBefore(today)) {
      const label = date.format('MMMM YYYY')
      months.push({
        month: date.month() + 1,
        year: date.year(),
        label: label.charAt(0).toUpperCase() + label.slice(1),
      })
      date = date.add(1, 'month')
    }

    return [
      {
        label: 'Courant (1 mois)',
      },
      ...months.reverse(),
    ]
  },
}

export default getters
