import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type { RootState } from '../state'
import type { CategoryState } from './state'
import type firebase from 'firebase'
import type { User, Account, Category, InputCategory } from '~/ts/types'
import { ECategoryType } from '~/ts/ECategoryType'

/**
 * Actions for categories
 */
const actions: ActionTree<CategoryState, RootState> = {
  /**
   * Create a category for the authed user in the selected account
   *
   * @param context Vuex context
   * @param category The category
   * @returns The promise of creation
   */
  async createCategory(
    { rootGetters, commit },
    { name, budget, balance, type, icon }: InputCategory
  ) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
      if (!aid) {
        throw new Error('Un compte doit être séléctionné')
      }

      const ba = parseFloat(balance)

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .doc(aid)
        .collection('categories')
      const cat = await ref.add({
        name,
        budget: parseFloat(budget),
        balance: type === ECategoryType.PLANNED_CREDIT ? -ba : ba,
        type,
        icon,
        createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Category & { createdAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
      return cat
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Edit a category of the authed user in the selected account
   *
   * @param context Vuex context
   * @param category The category
   * @returns The promise of edition
   */
  async editCategory(
    { rootGetters, commit },
    { id, name, budget, balance, type, icon }: InputCategory
  ) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
      if (!aid) {
        throw new Error('Un compte doit être séléctionné')
      }

      const ba = parseFloat(balance)

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .doc(aid)
        .collection('categories')
        .doc(id)
      await ref.update({
        name,
        budget: parseFloat(budget),
        balance: type === ECategoryType.PLANNED_CREDIT ? -ba : ba,
        type,
        icon,
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Category & { updatedAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Delete a category of the authed user in the selected account
   *
   * @param context Vuex context
   * @param id The id of the category
   * @returns The promise of deletion
   */
  async deleteCategory({ rootGetters, commit }, id) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
      if (!aid) {
        throw new Error('Un compte doit être séléctionné')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .doc(aid)
        .collection('categories')
        .doc(id)

      await ref.delete()
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Bind user's categories of the selected account
   */
  getCategories: firestoreAction(async function (
    this: Store<RootState>,
    { rootGetters, bindFirestoreRef, commit }
  ) {
    commit('SET_LOADING', true)
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
    if (!aid) {
      throw new Error('Un compte doit être séléctionné')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
      .collection('categories')
      .orderBy('createdAt')

    const bind = await bindFirestoreRef('data', ref, {
      serialize: (doc) => {
        const data = doc.data()
        Object.defineProperty(data, 'id', { value: doc.id })
        return data
      },
    })
    commit('SET_LOADING', false)
    return bind
  }),
}

export default actions
