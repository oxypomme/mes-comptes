import type { ActionTree } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '../state'
import type { AuthState } from './state'
import type { Account, InputUser, User } from '~/types'

/**
 * Auth actions
 */
const actions: ActionTree<AuthState, RootState> = {
  /**
   * Triggered when auth state change
   *
   * @param context Vuex context
   * @param payload The authed user, or null if logged out
   */
  async onAuth(
    { commit, dispatch },
    { authUser }: { authUser: firebase.User | null }
  ) {
    if (authUser) {
      commit('SET_AUTH_USER', authUser)
      await dispatch('account/bindAccounts', authUser, { root: true })
      await dispatch('agenda/bindAgenda', authUser, { root: true })
      await dispatch('bindSettings', authUser, { root: true })
    } else {
      commit('RESET_STATE')
      await dispatch('account/unbindAccounts', {}, { root: true })
      await dispatch('agenda/unbindAgenda', {}, { root: true })
      await dispatch('unbindSettings', {}, { root: true })
    }
  },
  /**
   * Create a user
   *
   * @param context Vuex context
   * @param payload The user
   * @returns The user initilisation promise
   */
  async createUser({ dispatch }, { email, password, balance }: InputUser) {
    const { user } = await this.$fire.auth.createUserWithEmailAndPassword(
      email,
      password
    )
    if (!user) {
      throw new Error('Une erreur est survenue lors de la création du compte')
    }

    const date = new Date()

    const ref = this.$fire.firestore.collection('users').doc(user.uid)
    await ref.set({
      resetDate: this.$fireModule.firestore.Timestamp.fromDate(
        new Date(date.getFullYear(), date.getMonth(), 1)
      ),
    })
    return dispatch(
      'account/createAccount',
      {
        name: 'Courant',
        balance: parseFloat(balance),
      } as Account,
      { root: true }
    )
  },
  /**
   * Delete authed user
   *
   * @param context Vuex context
   */
  async deleteUser({ getters, dispatch }) {
    if (!this.$fire.auth.currentUser) {
      throw new Error('Une erreur est survenue, essayez de vous reconnecter')
    }
    const uid = (getters.getUser as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    await dispatch('onAuth', { authUser: null })
    const ref = this.$fire.firestore.collection('users').doc(uid)
    await ref.delete()
    await this.$fire.auth.currentUser.delete()
  },
  /**
   * Update creditentials for authed user
   *
   * @param _ Vuex context
   * @param creditentials The new creditentials
   */
  async updateUser(
    _,
    { email, password }: { email: string; password: string }
  ) {
    if (!this.$fire.auth.currentUser) {
      throw new Error('Une erreur est survenue, essayez de vous reconnecter')
    }

    if (email) {
      await this.$fire.auth.currentUser.updateEmail(email)
      // await this.$fire.auth.currentUser.verifyBeforeUpdateEmail(email)
    }
    if (password) {
      await this.$fire.auth.currentUser.updatePassword(password)
    }
  },
  /**
   * Auth a user
   *
   * @param context Vuex context
   * @param creditentials The creditentials
   */
  async loginUser(
    { getters },
    { email, password }: { email: string; password: string }
  ) {
    await this.$fire.auth.signInWithEmailAndPassword(email, password)
    // Awaiting onAuth end
    while (!getters.getUser) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  },
  /**
   * Sign out authed user
   *
   * @returns The sign out promise
   */
  signOut() {
    return this.$fire.auth.signOut()
  },
}

export default actions
