import type { GetterTree } from 'vuex'
import type { RootState } from '..'
import type { OperationState } from './state'

const getters: GetterTree<OperationState, RootState> = {
  getOperations: (state) => state,
}

export default getters
