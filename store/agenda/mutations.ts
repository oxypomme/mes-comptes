import type { MutationTree } from 'vuex'
import type { AgendaState } from './state'

const mutations: MutationTree<AgendaState> = {
  RESET_STATE: (state) => {
    state.data = []
  },
}

export default mutations
