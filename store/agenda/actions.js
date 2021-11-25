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
  updateEntry({ getters, rootGetters }, { index, property, value }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(getters.getAgenda[index].id)
    const data = {}
    data[property] = value
    return ref.update(data)
  },
  deleteEntry({ getters, rootGetters }, index) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(getters.getAgenda[index].id)
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
