import type { ActionTree } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '..'
import type { AuthState } from './state'
import { Account, InputUser, User } from '~/types'

const actions: ActionTree<AuthState, RootState> = {
  async onAuth(
    { commit, dispatch },
    { authUser }: { authUser: firebase.User | null }
  ) {
    if (authUser) {
      commit('SET_AUTH_USER', authUser)
      await dispatch('account/bindAccounts', authUser, { root: true })
      await dispatch('agenda/bindAgenda', authUser, { root: true })
      await dispatch('bindSettings', {}, { root: true })
    } else {
      commit('RESET_STATE')
      await dispatch('account/unbindAccounts', {}, { root: true })
      await dispatch('agenda/unbindAgenda', {}, { root: true })
      await dispatch('unbindSettings', {}, { root: true })
    }
  },
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
  async updateUser(_, { email, password }) {
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
  async loginUser({ getters }, { email, password }) {
    await this.$fire.auth.signInWithEmailAndPassword(email, password)
    // Awaiting onAuth end
    while (!getters.getUser) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  },
  signOut() {
    return this.$fire.auth.signOut()
  },
}

export default actions
