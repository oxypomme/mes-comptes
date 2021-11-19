import { firestoreAction } from 'vuexfire'

export default {
  async createOperation({ rootGetters }, { name, amount, category, modifier }) {
    const amnt = parseFloat(amount) * modifier
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    let cref = null
    if (category) cref = ref.collection('categories').doc(category)
    await ref.collection('operations').add({
      name,
      amount: amnt,
      category: cref,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
  },
  async editOperation({ rootGetters }, { id, name, amount, category }) {
    const amnt = parseFloat(amount)
    if (category && typeof category !== 'string') {
      category = category.id
    }
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
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
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      })
  },
  deleteOperation({ rootGetters }, { id }) {
    // const amnt = parseFloat(amount)
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)

    return ref.collection('operations').doc(id).delete()
  },
  getOperations: firestoreAction(async function (
    { rootGetters, bindFirestoreRef },
    { limit }
  ) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
      .collection('operations')
      .orderBy('createdAt', 'desc')
    // .limit(limit)

    await bindFirestoreRef('data', ref)
  }),
}
