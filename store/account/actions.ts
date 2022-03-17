import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type { RootState } from '../state'
import type { AccountState } from './state'
import type firebase from 'firebase'
import type { Account, InputAccount, User } from '~/ts/types'

/**
 * Actions for user's accounts
 */
const actions: ActionTree<AccountState, RootState> = {
  /**
   * Create an account for the authed user
   *
   * @param context Vuex context
   * @param account The account
   * @returns The promise of creation
   */
  createAccount({ rootGetters }, { name, balance }: InputAccount) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
    return ref.add({
      name,
      balance: parseFloat(balance),
      operationCount: 0,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Account & { createdAt: firebase.firestore.FieldValue })
  },
  /**
   * Edit an account of the authed user
   *
   * @param context Vuex context
   * @param account The account
   * @returns The promise of edition
   */
  editAccount({ rootGetters }, { id, name, balance }: InputAccount) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(id)
    return ref.update({
      name,
      balance: parseFloat(balance),
      updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Account & { updatedAt: firebase.firestore.FieldValue })
  },
  /**
   * Delete an account of the authed user
   *
   * @param context Vuex context
   * @param id The id of the account
   * @returns The promise of deletion
   */
  deleteAccount({ rootGetters }, id: string) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(id)
    return ref.delete()
  },
  /**
   * Bind user's accounts to the state
   */
  bindAccounts: firestoreAction(function (
    this: Store<RootState>,
    { bindFirestoreRef },
    { uid }: firebase.User
  ) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .orderBy('createdAt')
    return bindFirestoreRef('accounts', ref, { wait: true })
  }),
  /**
   * Unbind user's accounts to the state
   */
  unbindAccounts: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('accounts', false)
    commit('RESET_STATE')
  }),
  /**
   * Update user's selected account, then fetch linked categories and operations
   */
  selectAccount: firestoreAction(async function (
    this: Store<RootState>,
    { rootGetters, getters, dispatch, bindFirestoreRef },
    index
  ) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const aid = (getters.getAccounts[index] as Account | null)?.id
    if (!aid) {
      throw new Error('Un compte doit être séléctionné')
    }
    if (aid === getters.getCurrent?.id) {
      return
    }
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    await bindFirestoreRef('current', ref, { wait: true })
    // TODO?: No await ?
    dispatch('operations/getOperations', {}, { root: true })
    return dispatch('categories/getCategories', null, { root: true })
  }),
}

export default actions
