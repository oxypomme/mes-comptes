import type { GetterTree, ActionTree, MutationTree } from 'vuex'
import { firestoreAction, vuexfireMutations } from 'vuexfire'
import type firebase from 'firebase'
import type { SettingsState, User } from '~/types'

export const state = () => ({
  settings: {} as Partial<SettingsState>,
  title: 'Mes Comptes',
})

export type RootState = ReturnType<typeof state>

export const mutations: MutationTree<RootState> = {
  ...vuexfireMutations,
  RESET_SETTINGS_STATE: (state) => {
    state.settings = {}
  },
  SET_TITLE: (state, title) => {
    state.title = title
  },
}

export const actions: ActionTree<RootState, RootState> = {
  updateSettings({ rootGetters }, { resetDate }) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore.collection('users').doc(uid)
    return ref.set(
      {
        resetDate: this.$fireModule.firestore.Timestamp.fromDate(resetDate),
      },
      { merge: true }
    )
  },
  bindSettings() {
    return firestoreAction(({ bindFirestoreRef }, { uid }: firebase.User) => {
      const ref = this.$fire.firestore.collection('users').doc(uid)
      return bindFirestoreRef('settings', ref, { wait: true })
    })
  },
  unbindSettings: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('settings', false)
    return commit('RESET_SETTINGS_STATE')
  }),
}

export const getters: GetterTree<RootState, RootState> = {
  getSettings: (state) => state.settings,
  getTitle: (state) => state.title,
}
