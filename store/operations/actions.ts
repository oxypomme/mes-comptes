import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '../state'
import type { OperationState } from './state'
import type {
  Account,
  Category,
  InputOperation,
  Operation,
  User,
} from '~/types'

/**
 * Actions for user's operations
 */
const actions: ActionTree<OperationState, RootState> = {
  /**
   * Create an operation for the authed user in the selected account
   *
   * @param param0 Vuex context
   * @param param1 The operation
   * @returns The promise of creation
   */
  createOperation(
    { rootGetters },
    { name, amount, category, modifier }: InputOperation
  ) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
    if (!aid) {
      throw new Error('Un compte doit être séléctionné')
    }

    const amnt = parseFloat(amount) * modifier
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)

    // Get category reference
    let cref = null
    if (category && typeof category === 'string')
      cref = ref.collection('categories').doc(category)

    return ref.collection('operations').add({
      name,
      amount: amnt,
      category: cref,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Operation & { createdAt: firebase.firestore.FieldValue })
  },
  /**
   * Edit an operation for the auther user in the selected account
   *
   * @param context Vuex context
   * @param operation The operation
   * @returns The promise of edition
   */
  editOperation(
    { rootGetters },
    { id, name, amount, category }: InputOperation
  ) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const aid = (rootGetters['account/getCurrent'] as Account | null)?.id
    if (!aid) {
      throw new Error('Un compte doit être séléctionné')
    }

    // Parse amount & category
    const amnt = parseFloat(amount)
    if (category && typeof category !== 'string') {
      category = category.id
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    const cref = ref.collection('categories')
    return ref
      .collection('operations')
      .doc(id)
      .update({
        name,
        amount: amnt,
        category: category ? cref.doc(category) : null,
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Operation & { updatedAt: firebase.firestore.FieldValue })
  },
  /**
   * Delete an operation for the auther user in the selected account
   *
   * @param context Vuex context
   * @param id The id of the operation
   * @returns The promise of deletion
   */
  deleteOperation({ rootGetters }, id) {
    // const amnt = parseFloat(amount)
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
      .collection('operations')
      .doc(id)

    return ref.delete()
  },
  /**
   * Bind user's operations for the auther user in the selected account
   *
   * TODO: pagination
   */
  getOperations: firestoreAction(function (
    this: Store<RootState>,
    { rootGetters, bindFirestoreRef },
    {
      category,
    }: {
      limit: number
      category: number
    }
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
    const cref = ref.collection('categories')

    const oref = ref.collection('operations')

    let docref: firebase.firestore.Query
    if (category !== undefined) {
      const categories = rootGetters['categories/getCategories'] as Category[]
      docref = oref.where('category', '==', cref.doc(categories[category].id))
    }

    docref = oref.orderBy('createdAt', 'desc')
    // .limit(limit)
    return bindFirestoreRef('data', docref)
  }),
}

export default actions
