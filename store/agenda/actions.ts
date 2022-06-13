import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type { RootState } from '../state'
import type { AgendaState } from './state'
import type firebase from 'firebase'
import type { AgendaRow, User } from '~/ts/types'

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

      const ref = this.$fire.firestore
        .collection('users')
        .doc(uid)
        .collection('agenda')
      const row = await ref.add({
        name: 'Nom',
        category: 'Catégorie',
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
    const bind = await bindFirestoreRef('data', ref, { wait: true })
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
