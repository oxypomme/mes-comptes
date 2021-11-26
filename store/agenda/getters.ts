import type { GetterTree } from 'vuex'
import type { RootState } from '..'
import type { AgendaState } from './state'
import type { AgendaRow } from '~/types'

const getters: GetterTree<AgendaState, RootState> = {
  getAgenda: (state) => state.data,
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
