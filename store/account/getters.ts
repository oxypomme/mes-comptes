import type { GetterTree } from 'vuex'
import type { RootState } from '..'
import type { AccountState } from './state'

const getters: GetterTree<AccountState, RootState> = {
  getAccounts: (state) => state.accounts,
  getCurrent: (state) => state.current,
}

export default getters
