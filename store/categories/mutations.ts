import type { MutationTree } from 'vuex'
import type { CategoryState } from './state'

const mutations: MutationTree<CategoryState> = {
  RESET_STATE: (state) => {
    state.data = []
  },
}

export default mutations
