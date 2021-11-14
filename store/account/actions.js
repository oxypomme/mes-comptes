import { firestoreAction } from 'vuexfire'

export default {
  createAccount({ rootGetters }, { name, balance }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
    return ref.add({
      name,
      balance: parseFloat(balance),
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
  },
  editAccount({ rootGetters }, { id, name, balance }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(id)
    return ref.update({
      name,
      balance: parseFloat(balance),
      updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
  },
  deleteAccount({ rootGetters }, id) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(id)
    return ref.delete()
  },

  createCategory({ rootGetters }, { aid, name, max }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
      .collection('categories')
    return ref.add({
      name,
      max,
      balance: 0,
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    })
  },

  bindAccounts: firestoreAction(async function ({ bindFirestoreRef }, { uid }) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .orderBy('createdAt')
    await bindFirestoreRef('accounts', ref, { wait: true })
  }),
  unbindAccounts: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('accounts', false)
    unbindFirestoreRef('current', false)
    commit('RESET_STATE')
  }),
  selectAccount: firestoreAction(async function (
    { rootGetters, getters, bindFirestoreRef },
    index
  ) {
    const { uid } = rootGetters['auth/getUser']
    const { id: aid } = getters.getAccounts[index]
    if (aid === getters.getCurrent?.id) {
      return
    }
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
    await bindFirestoreRef('current', ref, { wait: true })
    await bindFirestoreRef('current.operations', ref.collection('operations'), {
      wait: true,
    })
    await bindFirestoreRef('current.categories', ref.collection('categories'), {
      wait: true,
    })
  }),
}
