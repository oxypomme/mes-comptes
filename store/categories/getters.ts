import type { GetterTree } from 'vuex'
import { RootState } from '..'
import { CategoryState } from './state'

const getter: GetterTree<CategoryState, RootState> = {
  getCategories: (state) => state.data,
}

export default getter
