import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '../state'
import type { CategoryState } from './state'
import type { User, Account, Category, InputCategory } from '~/types'

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
  createCategory(
    { rootGetters },
    { name, budget, balance, type }: InputCategory
  ) {
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
    return ref.add({
      name,
      budget: parseFloat(budget),
      balance: parseFloat(balance),
      type,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Category & { createdAt: firebase.firestore.FieldValue })
  },
  /**
   * Edit a category of the authed user in the selected account
   *
   * @param context Vuex context
   * @param category The category
   * @returns The promise of edition
   */
  editCategory(
    { rootGetters },
    { id, name, budget, balance, type }: InputCategory
  ) {
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
    return ref.update({
      name,
      budget: parseFloat(budget),
      balance: parseFloat(balance),
      type,
      updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Category & { updatedAt: firebase.firestore.FieldValue })
  },
  /**
   * Delete a category of the authed user in the selected account
   *
   * @param context Vuex context
   * @param id The id of the category
   * @returns The promise of deletion
   */
  deleteCategory({ rootGetters }, id) {
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

    return ref.delete()
  },
  /**
   * Bind user's categories of the selected account
   */
  getCategories: firestoreAction(async function (
    this: Store<RootState>,
    { rootGetters, bindFirestoreRef }
  ) {
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

    await bindFirestoreRef('data', ref)
  }),
}

export default actions
