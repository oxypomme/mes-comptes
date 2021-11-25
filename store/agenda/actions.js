import { firestoreAction } from 'vuexfire'

export default {
  createEntry({ rootGetters }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    return ref.add({
      name: 'Nom',
      category: 'Catégorie',
      modifier: -1,
      values: Array(12).fill(0),
    })
  },
  updateEntry({ rootGetters }, { id, property, value }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(id)
    const data = {}
    data[property] = value
    return ref.update(data)
  },
  deleteEntry({ rootGetters }, id) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(id)
    return ref.delete()
  },

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
