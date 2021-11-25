import { firestoreAction } from 'vuexfire'

export default {
  createEntry({ commit }) {
    return commit('ADD', {
      name: 'Nom',
      category: 'Catégorie',
      modifier: -1,
      values: Array(12).fill(0),
    })
  },
  updateEntry({ commit, getters }, { index, property, value }) {
    return commit('EDIT', {
      id: Object.keys(getters.getAgenda)[index],
      property,
      value,
    })
  },

  bindAgenda: firestoreAction(function ({ rootGetters, bindFirestoreRef }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    return bindFirestoreRef('bdata', ref, { wait: true })
  }),
  unbindAgenda: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('bdata', false)
    return commit('RESET_STATE')
  }),
}
