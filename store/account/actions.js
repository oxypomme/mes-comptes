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
      operationCount: 0,
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

  bindAccounts: firestoreAction(function ({ bindFirestoreRef }, { uid }) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('accounts')
      .orderBy('createdAt')
    return bindFirestoreRef('accounts', ref, { wait: true })
  }),
  unbindAccounts: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('accounts', false)
    return commit('RESET_STATE')
  }),
  selectAccount: firestoreAction(async function (
    { rootGetters, getters, dispatch, bindFirestoreRef },
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
