import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type { RootState } from '../state'
import type { AgendaState } from './state'
import type firebase from 'firebase'
import type {
  Account,
  AgendaRow,
  Category,
  InputAgendaRow,
  User,
} from '~/ts/types'
import { ECategoryType } from '~/ts/ECategoryType'

/**
 * Actions for user's agenda
 */
const actions: ActionTree<AgendaState, RootState> = {
  /**
   * Create a row for the authed user
   *
   * @param context Vuex context
   * @returns The promise of creation
   */
  async createEntry({ rootGetters, commit }) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const currentAccount = rootGetters['account/getCurrent'] as Account | null
      const category = (
        rootGetters['categories/getCategories'] as Category[]
      ).find(({ type }) => type === ECategoryType.PLANNED_DEBIT)

      const uRef = this.$fire.firestore.collection('users').doc(uid)
      const aRef = uRef.collection('agenda')
      const accRef =
        currentAccount && uRef.collection('accounts').doc(currentAccount.id)
      const catRef =
        category && accRef?.collection('categories').doc(category.id)

      const row = await aRef.add({
        name: 'Nom',
        account: accRef,
        category: catRef ?? '',
        modifier: -1,
        values: Array(12).fill(0),
        date: this.$fireModule.firestore.FieldValue.serverTimestamp(),
        createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as AgendaRow & { createdAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
      return row
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Update a row for the authed user
   *
   * @param context Vuex context
   * @param row The representation of a row
   * @returns The promise of edition
   */
  async updateEntry(
    { rootGetters, commit },
    {
      id,
      property,
      value,
    }: {
      id: string
      property: keyof AgendaRow
      value: AgendaRow[keyof AgendaRow]
    }
  ) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('agenda')
        .doc(id)
      await ref.update({
        [property]: value,
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Partial<AgendaRow> & { updatedAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Delete a row for the authed user
   *
   * @param context Vuex context
   * @param id The id of the row
   * @returns The promise of deletion
   */
  async deleteEntry({ rootGetters, commit }, id: string) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('agenda')
        .doc(id)
      await ref.delete()
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Update the status of a row for the authed user
   */
  async updateStatus({ rootGetters, commit }, { id, status }) {
    commit('SET_LOADING', true)
    try {
      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('agenda')
        .doc(id)
      await ref.update({
        status,
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Partial<AgendaRow> & { updatedAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Update detail of agenda row
   */
  async updateDetail(
    { commit, rootGetters },
    { id, account, category, currency, date }: InputAgendaRow
  ) {
    commit('SET_LOADING', true)
    try {
      if (!account) {
        throw new Error('Vous devez renseigner un compte')
      }

      const uid = (rootGetters['auth/getUser'] as User | null)?.uid
      if (!uid) {
        throw new Error('Vous devez être connecté pour effectuer cette action')
      }

      const uRef = this.$fire.firestore.collection('users').doc(uid)
      const rowRef = uRef.collection('agenda').doc(id)
      const accRef = uRef.collection('accounts').doc(account)
      const catRef = accRef.collection('categories').doc(category)

      await rowRef.update({
        account: accRef,
        category: catRef,
        currency,
        date: date.toFire(),
        updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
      } as Partial<AgendaRow> & { updatedAt: firebase.firestore.FieldValue })
      commit('SET_LOADING', false)
    } catch (error) {
      commit('SET_LOADING', false)
      throw error
    }
  },
  /**
   * Bind user's agenda to the state
   */
  bindAgenda: firestoreAction(async function (
    this: Store<RootState>,
    { bindFirestoreRef, commit },
    { uid }: firebase.User
  ) {
    commit('SET_LOADING', true)
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    const bind = await bindFirestoreRef('data', ref, {
      serialize: (doc) => {
        const data = doc.data()
        Object.defineProperty(data, 'id', { value: doc.id })
        return data
      },
      wait: true,
    })
    commit('SET_LOADING', false)
    return bind
  }),
  /**
   * Unbind user's agenda to the state
   */
  unbindAgenda: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('data', false)
    commit('RESET_STATE')
  }),
}

export default actions
