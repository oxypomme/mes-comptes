import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '../state'
import type { OperationState } from './state'
import type { Account, InputOperation, Operation, User } from '~/ts/types'
import dayjs from '~/ts/dayjs'

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
  async createOperation(
    { rootGetters, commit },
    { name, amount, category, modifier }: InputOperation
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

    const ope = await ref.collection('operations').add({
      name,
      amount: amnt,
      category: cref,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Operation & { createdAt: firebase.firestore.FieldValue })
    commit('SET_LOADING', false)
    return ope
  },
  /**
   * Edit an operation for the auther user in the selected account
   *
   * @param context Vuex context
   * @param operation The operation
   * @returns The promise of edition
   */
  async editOperation(
    { rootGetters, commit },
    { id, name, amount, category, modifier }: InputOperation
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

    // Parse amount & category
    const amnt = parseFloat(amount) * modifier
    if (category && typeof category !== 'string') {
      category = category.id
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    const cref = ref.collection('categories')

    const ope = await ref
      .collection('operations')
      .doc(id)
      .update({
        name,
        amount: amnt,
        category: category ? cref.doc(category) : null,
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Operation & { updatedAt: firebase.firestore.FieldValue })

    commit('SET_LOADING', false)
    return ope
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
   * @param date The selected date. month: 1-12
   */
  getOperations: firestoreAction(async function (
    this: Store<RootState>,
    { rootGetters, bindFirestoreRef, commit },
    { month, year }: { month?: number; year?: number }
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

    const oref = ref.collection('operations')

    let last = dayjs().add(1, 'day')
    if (month && year) {
      last = dayjs(`1/${month + 1}/${year}`, 'D/M/YYYY')
    }
    const first = last.subtract(1, 'month')

    const docref = oref
      .where(
        'createdAt',
        '>',
        this.$fireModule.firestore.Timestamp.fromDate(first.toDate())
      )
      .where(
        'createdAt',
        '<=',
        this.$fireModule.firestore.Timestamp.fromDate(last.toDate())
      )
      .orderBy('createdAt', 'desc')

    await bindFirestoreRef('data', docref, {
      serialize: (doc) => {
        const data = doc.data()
        Object.defineProperty(data, 'id', { value: doc.id })
        return data
      },
    })
    commit('SET_LOADING', false)
  }),
}

export default actions
