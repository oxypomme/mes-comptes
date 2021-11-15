import { firestoreAction } from 'vuexfire'

export default {
  createCategory({ rootGetters }, { name, budget, balance }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
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
    })
  },
  editCategory({ rootGetters }, { id, name, budget, balance }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
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
    })
  },
  deleteCategory({ rootGetters }, id) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
      .collection('categories')
      .doc(id)

    return ref.delete()
  },
  getCategories: firestoreAction(async function ({
    rootGetters,
    bindFirestoreRef,
  }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
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
