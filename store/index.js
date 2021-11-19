import { firestoreAction, vuexfireMutations } from 'vuexfire'

export const state = () => ({
  settings: {},
})

export const mutations = {
  ...vuexfireMutations,
  RESET_SETTINGS_STATE: (state) => {
    state.settings = []
  },
}

export const actions = {
  updateSettings({ rootGetters }, { resetDate }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore.collection('users').doc(uid)
    return ref.set(
      {
        resetDate: this.$fireModule.firestore.Timestamp.fromDate(resetDate),
      },
      { merge: true }
    )
  },
  bindSettings: firestoreAction(function ({ rootGetters, bindFirestoreRef }) {
    const { uid } = rootGetters['auth/getUser']
    const ref = this.$fire.firestore.collection('users').doc(uid)
    return bindFirestoreRef('settings', ref, { wait: true })
  }),
  unbindSettings: firestoreAction(function ({ unbindFirestoreRef }) {
    unbindFirestoreRef('settings', false)
    return commit('RESET_SETTINGS_STATE')
  }),
}

export const getters = {
  getSettings: (state) => state.settings,
}
