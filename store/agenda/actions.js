import { firestoreAction } from 'vuexfire'

export default {
  bindAgenda: firestoreAction(function ({ rootGetters, bindFirestoreRef }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    return bindFirestoreRef('data', ref, { wait: true })
  }),
  unbindAgenda: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('data', false)
    return commit('RESET_STATE')
  }),
}
