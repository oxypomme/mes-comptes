import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type { RootState } from '../state'
import type { OperationState } from './state'
import type firebase from 'firebase'
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
    { name, amount, category, modifier, date }: InputOperation
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

      // Setting date at 00:00 to avoid weird sort
      const d = date.startOf('day')

      const ope = await ref.collection('operations').add({
        name,
        amount: amnt,
        category: cref,
        date: d.toFire(),
        createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Operation & { createdAt: firebase.firestore.FieldValue })

      commit('SET_LOADING', false)
      return ope
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
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
    { id, name, amount, category, modifier, date }: InputOperation
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

      await ref
        .collection('operations')
        .doc(id)
        .update({
          name,
          amount: amnt,
          category: category ? cref.doc(category) : null,
          date: date && date.toFire(),
          updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
        } as Operation & { updatedAt: firebase.firestore.FieldValue })

      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Delete an operation for the auther user in the selected account
   *
   * @param context Vuex context
   * @param id The id of the operation
   * @returns The promise of deletion
   */
  async deleteOperation({ rootGetters, commit }, id) {
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
        .collection('operations')
        .doc(id)

      await ref.delete()
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Bind user's operations for the auther user in the selected account
   *
   * @param date The selected date. month: 1-12
   */
  getOperations: firestoreAction(async function (
    this: Store<RootState>,
    { rootGetters, bindFirestoreRef, commit },
    { value: date }: { value?: dayjs.Dayjs }
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

    const last = (date ? date.add(1, 'month') : dayjs()).add(1, 'day')
    const first = date ?? last.subtract(1, 'month')

    const docref = oref
      .where(
        'date',
        '>=',
        this.$fireModule.firestore.Timestamp.fromDate(first.toDate())
      )
      .where(
        'date',
        '<=',
        this.$fireModule.firestore.Timestamp.fromDate(last.toDate())
      )

    const bind = await bindFirestoreRef('data', docref, {
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
