import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { CategoryState } from './state'
import { ECategoryType } from '~/ts/ECategoryType'
import type { AgendaComputed, Category } from '~/ts/types'

/**
 * Getters for user's categories
 */
const getter: GetterTree<CategoryState, RootState> = {
  /**
   * Get the categories of the authed user in the selected account
   *
   * @param state The state
   * @param rootGetters The getters of the whole store
   * @returns The categories
   */
  getCategories: (state, _a, _b, rootGetters) => {
    const agenda = rootGetters['agenda/getCurrent'] as AgendaComputed
    const weekcount = rootGetters.getWeekCount

    const categories: Category[] = []
    for (const { id, name, budget, balance, type, icon } of state.data) {
      let i = icon
      let b = budget
      let ba = balance
      switch (type) {
        case ECategoryType.BUDGET:
          i = icon ?? 'mdi-chart-pie'
          b = budget * weekcount
          break
        case ECategoryType.CALCULATED:
          i = icon ?? 'mdi-calculator'
          b =
            agenda.total -
            state.data
              .filter(({ type }) => type === ECategoryType.BUDGET)
              .reduce((sum, { budget }) => sum + budget * weekcount, 0)
          break
        case ECategoryType.PLANNED_CREDIT:
          i = icon ?? 'mdi-calendar'
          ba = -balance
          b = agenda.credit
          break
        case ECategoryType.PLANNED_DEBIT:
          i = icon ?? 'mdi-calendar'
          b = agenda.debit
          break
        default:
          break
      }

      categories.push({
        id,
        name,
        budget: b,
        balance: ba,
        type,
        icon: i,
      })
    }

    return categories
  },
}

export default getter
