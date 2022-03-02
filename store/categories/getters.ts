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
    // 🤮
    const categories: Category[] = JSON.parse(JSON.stringify(state.data))

    for (const categ of categories) {
      switch (categ.type) {
        case ECategoryType.CALCULATED:
          categ.budget =
            agenda.total -
            categories
              .filter(({ type }) => type === ECategoryType.BUDGET)
              .reduce((sum, { budget }) => sum + budget, 0)
          break
        case ECategoryType.PLANNED_CREDIT:
          categ.budget = -agenda.credit
          break
        case ECategoryType.PLANNED_DEBIT:
          // categ.debug = 'planned+'
          categ.budget = agenda.debit
          break
        default:
          break
      }
    }
    return categories
  },
}

export default getter
