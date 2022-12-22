import { region as rregion } from 'firebase-functions'
import {
  firestore,
  auth as fireauth,
  messaging,
  initializeApp,
} from 'firebase-admin'

initializeApp()
export const store = firestore
export const auth = fireauth
export const fcm = messaging
export const region = rregion('europe-west1')
