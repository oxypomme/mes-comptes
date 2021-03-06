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
  async createAccount(
    { rootGetters, commit },
    { name, balance }: InputAccount
  ) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
      const acc = await ref.add({
        name,
        balance: parseFloat(balance),
        operationCount: 0,
        createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Account & { createdAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
      return acc
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Edit an account of the authed user
   *
   * @param context Vuex context
   * @param account The account
   * @returns The promise of edition
   */
  async editAccount(
    { rootGetters, commit },
    { id, name, balance }: InputAccount
  ) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .doc(id)
      await ref.update({
        name,
        balance: parseFloat(balance),
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Account & { updatedAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Delete an account of the authed user
   *
   * @param context Vuex context
   * @param id The id of the account
   * @returns The promise of deletion
   */
  async deleteAccount({ rootGetters, commit }, id: string) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .doc(id)
      await ref.delete()
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Bind user's accounts to the state
   */
  bindAccounts: firestoreAction(async function (
    this: Store<RootState>,
    { bindFirestoreRef, commit },
    { uid }: firebase.User
  ) {
    commit('SET_LOADING', true)
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .orderBy('createdAt')
    const bind = await bindFirestoreRef('accounts', ref, { wait: true })
    commit('SET_LOADING', false)
    return bind
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
    { rootGetters, getters, dispatch, bindFirestoreRef, commit },
    index
  ) {
    commit('SET_LOADING', true)
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
    const bind = await bindFirestoreRef('current', ref, { wait: true })
    await dispatch('operations/getOperations', {}, { root: true })
    await dispatch('categories/getCategories', null, { root: true })
    commit('SET_LOADING', false)
    return bind
  }),
}

export default actions
