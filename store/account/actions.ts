import { firestoreAction } from 'vuexfire'
import type { ActionTree } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '..'
import type { AccountState } from './state'
import { Account, InputAccount, User } from '~/types'

const actions: ActionTree<AccountState, RootState> = {
  /**
   * Create an account for the authed user
   *
   * @param context Vuex context
   * @param account The account
   * @returns The promise of addition
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

  // TODO: Test this, as it can be broken
  bindAccounts() {
    return firestoreAction(({ bindFirestoreRef }, { uid }: firebase.User) => {
      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('accounts')
        .orderBy('createdAt')
      return bindFirestoreRef('accounts', ref, { wait: true })
    })
  },
  unbindAccounts: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('accounts', false)
    commit('RESET_STATE')
  }),
  selectAccount: firestoreAction(async function (
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
    dispatch(
      'operations/getOperations',
      {
        limit: 100,
      },
      { root: true }
    )
    return dispatch('categories/getCategories', null, { root: true })
  }),
}

export default actions
