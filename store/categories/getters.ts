import type { GetterTree } from 'vuex'
import type { RootState } from '../state'
import type { CategoryState } from './state'
import { ECategoryType } from '~/ts/ECategoryType'
import type { Account, AgendaComputed, Category } from '~/ts/types'
import { parseBudget, toLS } from '~/ts/format'

export type ComputedCategory = Category & { compBudget: number }

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
  getCategories: (state, _getters, _rootState, rootGetters) => {
    const agenda = rootGetters['agenda/getCurrent'] as AgendaComputed

    const calcBudget = (exp: string) =>
      parseBudget(exp, rootGetters.getDayCount, rootGetters.getWeekCount)

    const categories: ComputedCategory[] = []
    for (const { id, name, budget, balance, type, icon } of state.data) {
      let i = icon
      let b = budget // Here, it's an expression
      let ba = balance
      switch (type) {
        case ECategoryType.BUDGET:
          i = icon ?? 'mdi-chart-pie'
          b = calcBudget(budget).toString()
          break
        case ECategoryType.CALCULATED:
          i = icon ?? 'mdi-calculator'
          b = (
            agenda.total -
            state.data
              .filter(({ type }) => type === ECategoryType.BUDGET)
              .reduce((sum, { budget }) => sum + calcBudget(budget), 0)
          ).toString()
          break
        case ECategoryType.PLANNED_CREDIT:
          i = icon ?? 'mdi-calendar'
          ba = -balance
          b = agenda.credit.toString()
          break
        case ECategoryType.PLANNED_DEBIT:
          i = icon ?? 'mdi-calendar'
          b = agenda.debit.toString()
          break
        default:
          break
      }

      const fb = parseFloat(b)
      const ratio = Math.abs(ba) / Math.abs(fb)

      categories.push({
        id,
        name,
        budget,
        compBudget: fb,
        balance: ba,
        type,
        icon: i,
        computed: {
          // Tooltip for detailed usage of a Category
          tooltip: `${toLS(Math.abs(ba))} / ${toLS(Math.abs(fb))} (${toLS(
            ratio,
            undefined,
            {
              style: 'percent',
            }
          )})`,
          // Calculate usage of a Category and format it
          usage: toLS(fb - ba),
          // Calculate usage ratio of a Category
          ratio: {
            color: ratio < 0.5 ? 'green' : ratio <= 0.75 ? 'orange' : 'red',
            value: ratio,
          },
        },
      })
    }

    return categories
  },
  /**
   * Total balance of account minus categories budget
   */
  getRoulement: (_state, getters, _rootState, rootGetters): string => {
    const account = rootGetters['account/getCurrent'] as Account
    if (account) {
      let value = account.balance
      const check = {
        plannedCredit: false,
        plannedDebit: false,
      }
      for (const {
        compBudget,
        balance,
        type,
      } of getters.getCategories as ComputedCategory[]) {
        switch (type) {
          case ECategoryType.PLANNED_CREDIT:
            value += compBudget - balance
            check.plannedCredit = true
            break
          case ECategoryType.PLANNED_DEBIT:
            value += balance - compBudget
            check.plannedDebit = true
            break
          default:
            value -= Math.max(compBudget - balance, 0)
            break
        }
      }

      if (check.plannedCredit && check.plannedDebit) {
        return toLS(value)
      }
      return '-1'
    }
    return '-1'
  },
  /**
   * Get the loading state
   *
   * @param state The state
   * @returns The loading state
   */
  getLoadingState: (state) => state.loading,
}

export default getter
