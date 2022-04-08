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
    let resetDate = dayjs()
    if (state.settings.resetDate) {
      resetDate = dayjs(state.settings.resetDate.toDate())
    } else {
      resetDate = resetDate.add(1, 'month')
    }
    return resetDate.diff(resetDate.subtract(1, 'month'), 'week')
  },
  /**
   * Get months since account creations
   *
   * @param state The state
   * @returns The months
   */
  getAvailableMonths: (state): { value?: dayjs.Dayjs; label: string }[] => {
    const today = dayjs()
    const months: { value: dayjs.Dayjs; label: string }[] = []

    let date = dayjs(state.settings.createdAt?.toDate() ?? undefined)
    while (date.isBefore(today)) {
      months.push({
        value: date,
        label: date.format('MMMM YYYY'),
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
  /**
   * Return the current month based on resetDate
   *
   * @param state The state
   * @returns The month label and value (month id, 0-11)
   */
  getCurrentMonth: (state) => {
    const resetDate = state.settings.resetDate?.toDate()
    const date = resetDate ? dayjs(resetDate).subtract(1, 'month') : dayjs()
    return {
      label: date.format('MMMM'),
      value: date.month(),
    }
  },
}

export default getters
