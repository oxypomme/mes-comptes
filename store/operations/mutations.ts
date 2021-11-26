import type { MutationTree } from 'vuex'
import { OperationState } from './state'

const mutations: MutationTree<OperationState> = {
  RESET_STATE: (state) => {
    state.data = []
  },
}

export default mutations
