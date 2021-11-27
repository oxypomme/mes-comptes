import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '..'
import type { CategoryState } from './state'
import { User, Account, Category } from '~/types'

const actions: ActionTree<CategoryState, RootState> = {
  createCategory({ rootGetters }, { name, budget, balance }) {
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
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Category & { createdAt: firebase.firestore.FieldValue })
  },
  editCategory({ rootGetters }, { id, name, budget, balance }) {
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
      updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Category & { updatedAt: firebase.firestore.FieldValue })
  },
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
