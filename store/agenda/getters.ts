import type { GetterTree } from 'vuex'
import dayjs from 'dayjs'
import type { RootState } from '../state'
import type { AgendaState } from './state'
import type { AgendaRow } from '~/ts/types'

const agendaMonthReducer =
  (month: number) =>
  (sum: number, { values }: AgendaRow) =>
    sum + values[month - 1]

/**
 * Getters for user's agenda
 */
const getters: GetterTree<AgendaState, RootState> = {
  /**
   * Get the full agenda
   *
   * @param state The state
   * @returns The data
   */
  getAgenda: (state) => state.data,
  /**
   * Get the monthly budget for a chosen month
   *
   * @param _ The state
   * @param getters The other getters
   * @returns A function to get the budget
   */
  getMonth:
    (_, getters) =>
    (
      month: number // in range 1-12
    ) => {
      const rows: AgendaRow[] = getters.getAgenda
      let resetDate = dayjs(
        getters.getSettings?.resetDate.toDate() ?? undefined
      )

      const debit = rows
        .filter(({ modifier }) => modifier === -1)
        .reduce(agendaMonthReducer(month), 0)
      const credit = rows
        .filter(({ modifier }) => modifier === 1)
        .reduce(agendaMonthReducer(month), 0)

      if (month < resetDate.month()) {
        resetDate = resetDate.add(1, 'year')
      }

      return {
        debit,
        credit,
        total: credit - debit,
        label: resetDate.set('month', month - 1).format('MMMM YYYY'),
      }
    },
  /**
   * Get current month budget
   *
   * @param _ The state
   * @param getters The other getters
   * @returns A function to get the budget
   */
  getCurrent: (_, getters) => {
    const resetDate = dayjs(
      getters.getSettings?.resetDate.toDate() ?? undefined
    )

    return getters.getMonth(resetDate.month())
  },
  /**
   * Get the loading state
   *
   * @param state The state
   * @returns The loading state
   */
  getLoadingState: (state) => state.loading,
}

export default getters
