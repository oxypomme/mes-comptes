import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { CategoryState } from './state'
import { ECategoryType } from '~/ECategoryType'
import type { AgendaComputed, Category } from '~/types'

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
    for (const { id, name, budget, balance, type } of state.data) {
      let b = budget
      switch (type) {
        case ECategoryType.BUDGET:
          b = budget * weekcount
          break
        case ECategoryType.CALCULATED:
          b =
            agenda.total -
            state.data
              .filter(({ type }) => type === ECategoryType.BUDGET)
              .reduce((sum, { budget }) => sum + budget * weekcount, 0)
          break
        case ECategoryType.PLANNED_CREDIT:
          b = -agenda.credit
          break
        case ECategoryType.PLANNED_DEBIT:
          b = agenda.debit
          break
        default:
          break
      }

      categories.push({
        id,
        name,
        budget: b,
        balance,
        type,
      })
    }

    return categories
  },
}

export default getter
