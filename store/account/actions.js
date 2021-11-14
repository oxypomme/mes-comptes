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
      balance,
    })
  },
  createCategory({ rootGetters }, { aid, name, balance }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .doc(aid)
      .collection('categories')
    return ref.add({
      name,
      balance,
    })
  },

  bindAccounts: firestoreAction(async function ({ bindFirestoreRef }, { uid }) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
    await bindFirestoreRef('accounts', ref, { wait: true })
  }),
  unbindAccounts: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('accounts', false)
    commit('RESET_STATE')
  }),
}
