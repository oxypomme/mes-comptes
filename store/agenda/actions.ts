import { firestoreAction } from 'vuexfire'
import type { ActionTree, Store } from 'vuex'
import type firebase from 'firebase'
import type { RootState } from '..'
import type { AgendaState } from './state'
import { AgendaRow, User } from '~/types'

const actions: ActionTree<AgendaState, RootState> = {
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
  updateEntry(
    { rootGetters },
    {
      id,
      property,
      value,
    }: { id: string; property: keyof AgendaRow; value: any }
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
  unbindAgenda: firestoreAction(function ({ commit, unbindFirestoreRef }) {
    unbindFirestoreRef('data', false)
    commit('RESET_STATE')
  }),
}

export default actions
