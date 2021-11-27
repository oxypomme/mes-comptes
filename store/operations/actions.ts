import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '..'
import type { OperationState } from './state'
import type {
  Account,
  Category,
  InputOperation,
  Operation,
  User,
} from '~/types'

const actions: ActionTree<OperationState, RootState> = {
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
  deleteOperation({ rootGetters }, { id }) {
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

    return ref.collection('operations').doc(id).delete()
  },
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
