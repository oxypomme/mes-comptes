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

    // Used to calc nuber of month within period
    const extendedPeriod = {
      start: period.start.startOf('month'),
      end: period.end.endOf('month'),
    }

    // Get longer month within period
    const max = {
      month: dayjs(),
      days: 0,
    }
    for (
      let i = 0;
      i <= extendedPeriod.end.diff(extendedPeriod.start, 'months');
      i++
    ) {
      const curr = period.start.add(i, 'month')
      const limitedCurr = {
        start: dayjs.max(curr.startOf('month'), period.start),
        end: dayjs.min(curr.endOf('month'), period.end),
      }

      const days = limitedCurr.end.diff(limitedCurr.start, 'days') + 1
      if (days > max.days) {
        max.month = curr
        max.days = days
      }
    }

    return {
      label: max.month.format('MMMM'),
      value: max.month.month() + 1,
    }
  },
}

export default getters
