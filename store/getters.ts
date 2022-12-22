import type { GetterTree } from 'vuex'
import type { RootState } from './state'
import { getCurrentMonth } from '~/functions/src/utils/period'
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
   * Number of weeks in current period
   */
  getWeekCount: (state) => {
    const today = dayjs()
    // Parse period
    let period = {
      start: today.startOf('month'),
      end: today.endOf('month'),
    }
    if (state.settings.activePeriod) {
      period = {
        start: dayjs(state.settings.activePeriod?.start.toDate()),
        end: dayjs(state.settings.activePeriod?.end.toDate()),
      }
    }
    return period.end.diff(period.start, 'week')
  },
  /**
   * Number of weeks in current period by the count of reset day
   *
   * @deprecated
   */
  getResetWeekCount: (_state) => {
    return 0
  },
  /**
   * Get months since account creation
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
   * Return the current month based on activePeriod
   *
   * @param state The state
   * @returns The month label and value (month id, 0-11)
   */
  getCurrentMonth: (state) => {
    const today = dayjs()
    // Parse period
    let period = {
      start: today.startOf('month'),
      end: today.endOf('month'),
    }
    if (state.settings.activePeriod) {
      period = {
        start: dayjs(state.settings.activePeriod?.start.toDate()),
        end: dayjs(state.settings.activePeriod?.end.toDate()),
      }
    }
    const curr = getCurrentMonth(period)
    return {
      ...curr,
      value: curr.value + 1,
    }
  },
}

export default getters
