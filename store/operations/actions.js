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
    const cref = ref.collection('categories').doc(category)
    await ref.collection('operations').add({
      name,
      amount: parseFloat(amount),
      category: cref,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
    await cref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(-amount),
    })
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(amount),
      operationCount: this.$fireModule.firestore.FieldValue.increment(1),
    })
  },
  async editOperation(
    { rootGetters },
    { id, name, amount, category, oldAmount, oldCategory }
  ) {
    if (typeof category !== 'string') {
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
        amount: parseFloat(amount),
        category: cref.doc(category),
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      })
    await cref.doc(oldCategory.id).update({
      balance: this.$fireModule.firestore.FieldValue.increment(oldAmount),
    })
    await cref.doc(category).update({
      balance: this.$fireModule.firestore.FieldValue.increment(-amount),
    })
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(
        -(oldAmount - amount)
      ),
    })
  },
  async deleteOperation({ rootGetters }, { id, amount, category }) {
    const { uid } = rootGetters['auth/getUser']
    const aid = rootGetters['account/getCurrent'].id
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)

    await ref.collection('operations').doc(id).delete()
    await ref
      .collection('categories')
      .doc(category.id)
      .update({
        balance: this.$fireModule.firestore.FieldValue.increment(amount),
      })
    return ref.update({
      balance: this.$fireModule.firestore.FieldValue.increment(-amount),
      operationCount: this.$fireModule.firestore.FieldValue.increment(-1),
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

    await bindFirestoreRef('data', ref)
  }),
}
