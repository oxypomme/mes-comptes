import type firebase from 'firebase'
import type { ECategoryType } from './ECategoryType'

interface FirestoreData {
  id?: string
}

type ValueModifier = -1 | 1

interface Account extends FirestoreData {
  name: string
  balance: number // float
  operationCount?: number
}
type InputAccount = Omit<Account, 'balance' | 'operationCount'> & {
  balance: string
}

interface AgendaRow extends FirestoreData {
  name: string
  category: string
  modifier: ValueModifier
  values: number[] // 1 element for each month (12 elements in total); float
}

interface AgendaComputed {
  debit: number
  credit: number
  total: number
}

interface Category extends FirestoreData {
  name: string
  icon?: string
  balance: number // float
  budget: number // float
  type: ECategoryType
}
type InputCategory = Omit<Category, 'balance' | 'budget'> & {
  balance: string
  budget: string
}

interface Operation extends FirestoreData {
  _doc?: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  name: string
  amount: number // float
  category: firebase.firestore.DocumentReference | null
  modifier: ValueModifier
}
type InputOperation = Omit<Operation, 'amount' | 'category'> & {
  amount: string
  category: string | firebase.firestore.DocumentReference | null
}

interface User {
  uid: string
  email: string
  emailVerified: boolean
}
interface InputUser {
  email: string
  password: string
  balance: string
}

interface SettingsState {
  resetDate: firebase.firestore.Timestamp
  createdAt: firebase.firestore.Timestamp
  lightTheme: boolean
}
type Settings = Omit<SettingsState, 'resetDate'> & {
  resetDate: Date
}
