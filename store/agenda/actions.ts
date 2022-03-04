import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '../state'
import type { AgendaState } from './state'
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
  createEntry({ rootGetters }) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    return ref.add({
      name: 'Nom',
      category: 'Catégorie',
      modifier: -1,
      values: Array(12).fill(0),
      createdAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as AgendaRow & { createdAt: firebase.firestore.FieldValue })
  },
  /**
   * Update a row for the authed user
   *
   * @param context Vuex context
   * @param row The representation of a row
   * @returns The promise of edition
   */
  updateEntry(
    { rootGetters },
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
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(id)
    return ref.update({
      [property]: value,
      updatedAt: this.$fireModule.firestore.FieldValue.serverTimestamp(),
    } as Partial<AgendaRow> & { updatedAt: firebase.firestore.FieldValue })
  },
  /**
   * Delete a row for the authed user
   *
   * @param context Vuex context
   * @param id The id of the row
   * @returns The promise of deletion
   */
  deleteEntry({ rootGetters }, id: string) {
    const uid = (rootGetters['auth/getUser'] as User | null)?.uid
    if (!uid) {
      throw new Error('Vous devez être connecté pour effectuer cette action')
    }

    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
      .doc(id)
    return ref.delete()
  },
  /**
   * Bind user's agenda to the state
   */
  bindAgenda: firestoreAction(function (
    this: Store<RootState>,
    { bindFirestoreRef },
    { uid }: firebase.User
  ) {
    const ref = this.$fire.firestore
      .collection('users')
      .doc(uid)
      .collection('agenda')
    return bindFirestoreRef('data', ref, { wait: true })
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
