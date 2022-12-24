import type { ActionTree, Store } from 'vuex'
import dayjs from 'dayjs'
import { firestoreAction } from 'vuexfire'
import type { RootState } from '../state'
import type { AuthState } from './state'
import type firebase from 'firebase'
import type { Account, InputUser, User } from '~/ts/types'
import { getDeviceType } from '~/ts/device'

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
      await dispatch('bindSettings', authUser, { root: true })
      await Promise.all([
        dispatch('agenda/bindAgenda', authUser, { root: true }),
        dispatch('account/bindAccounts', authUser, { root: true }),
        dispatch('bindDevices', authUser),
      ])
    } else {
      commit('RESET_STATE')
      await Promise.all([
        dispatch('unbindDevices', {}),
        dispatch('account/unbindAccounts', {}, { root: true }),
        dispatch('agenda/unbindAgenda', {}, { root: true }),
      ])
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

    const date = dayjs().startOf('month')

    const ref = this.$fire.firestore.collection('users').doc(user.uid)
    await ref.set({
      devices: [],
      activePeriod: {
        start: date.toFire(),
        end: date.endOf('month').toFire(),
      },
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
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
    { getters, dispatch },
    { email, password }: { email: string; password: string }
  ) {
    await this.$fire.auth.signInWithEmailAndPassword(email, password)
    // Awaiting onAuth end
    while (!getters.getUser) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    dispatch('setupFCM')
  },
  /**
   * Sign out authed user
   *
   * @returns The sign out promise
   */
  signOut() {
    return this.$fire.auth.signOut()
  },
  /**
   * Setup FCM (push notification service)
   *
   * @param context Vuex context
   */
  async setupFCM({ dispatch }) {
    const perm = await Notification.requestPermission()

    if (perm === 'granted') {
      const fcmToken = await this.$fire.messaging.getToken()
      dispatch('addDeviceToUser', { deviceId: fcmToken })

      this.$fire.messaging.onMessage(({ notification }) => {
        this.app.$toast.global.info(notification.body)
      })
    }
  },
  /**
   * Add device to current user
   *
   * @param context Vuex context
   * @param param1 Device info
   */
  async addDeviceToUser({ getters }, { deviceId }: { deviceId: string }) {
    const uid = (getters.getUser as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    // Get device type
    const type = getDeviceType()

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('devices')
      .doc(deviceId)
    await ref.set(
      {
        type: type === 'tablet' ? 'mobile' : type,
        lastUsed: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      },
      { mergeFields: ['lastUsed'] }
    )
  },
  async removeDeviceToUser({ getters }, { deviceId }: { deviceId: string }) {
    const uid = (getters.getUser as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('devices')
      .doc(deviceId)
    await ref.delete()
  },
  /**
   * Bind user's linked devices to the state
   */
  bindDevices: firestoreAction(async function (
    this: Store<RootState>,
    { bindFirestoreRef },
    { uid }: firebase.User
  ) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('devices')
    const bind = await bindFirestoreRef('devices', ref, {
      serialize: (doc) => {
        const data = doc.data()
        Object.defineProperty(data, 'id', { value: doc.id })
        return data
      },
      wait: true,
    })
    return bind
  }),
  /**
   * Unbind user's linke devices to the state
   */
  unbindDevices: firestoreAction(function ({ unbindFirestoreRef }) {
    unbindFirestoreRef('devices', false)
  }),
}

export default actions
