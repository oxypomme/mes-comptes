import { firestore, auth as fireauth, initializeApp } from 'firebase-admin'

initializeApp()
export const store = firestore
export const auth = fireauth
