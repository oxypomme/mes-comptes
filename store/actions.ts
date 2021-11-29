import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import { firestoreAction } from 'vuexfire'
import type { RootState } from './state'
import type { Settings, User } from '~/types'

/**
 * Actions for root state
 */
const actions: ActionTree<RootState, RootState> = {
  /**
   * Update settings for the authed user
   *
   * @param context Vuex context
   * @param settings The new settings
   * @returns
   */
  updateSettings({ rootGetters }, { resetDate, lightTheme }: Settings) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore.collection('users').doc(uid)
    return ref.set(
      {
        resetDate: this.$fireModule.firestore.Timestamp.fromDate(resetDate),
        lightTheme,
      },
      { merge: true }
    )
  },
  /**
   * Bind user's settings to the state
   */
  bindSettings: firestoreAction(function (
    this: Store<RootState>,
    { bindFirestoreRef },
    { uid }: firebase.User
  ) {
    const ref = this.$fire.firestore.collection('users').doc(uid)

    return bindFirestoreRef('settings', ref, { wait: true })
  }),
  /**
   * Unbind user's settings to the state
   */
  unbindSettings: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('settings', false)
    return commit('RESET_SETTINGS_STATE')
  }),
}

export default actions
