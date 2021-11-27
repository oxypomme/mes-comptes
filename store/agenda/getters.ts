import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { AgendaState } from './state'
import type { AgendaRow } from '~/types'

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
    ) =>
      (getters.getAgenda as AgendaRow[])
        .map((row) => ({
          value: row.values[month - 1],
          modifier: row.modifier,
        }))
        .reduce((sum, el) => sum + (el.value || 0) * (el.modifier || -1), 0),
}

export default getters
