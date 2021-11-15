import { firestoreAction } from 'vuexfire'

export default {
  async createOperation({ rootGetters }, { name, amount, category }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    await ref.collection('operations').add({
      name,
      amount: parseFloat(amount),
      category,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(amount),
      operationCount: this.$fireModule.firestore.FieldValue.increment(1),
    })
  },
  async editOperation({ rootGetters }, { id, name, amount, oldAmount }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    await ref
      .collection('operations')
      .doc(id)
      .update({
        name,
        amount: parseFloat(amount),
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      })
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(
        -(oldAmount - amount)
      ),
    })
  },
  async deleteOperation({ rootGetters }, { id, amount }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)

    await ref.collection('operations').doc(id).delete()
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(-amount),
    })
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

    await bindFirestoreRef('operations.data', ref)
  }),
}
