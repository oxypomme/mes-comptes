import type { MutationTree } from 'vuex'
import type { AccountState } from './state'

const mutations: MutationTree<AccountState> = {
  RESET_STATE: (state) => {
    state.accounts = []
    state.current = null
  },
}

export default mutations
