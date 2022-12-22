import type dayjs from 'dayjs'
import type { ECategoryType } from './ECategoryType'
import type { Currency } from './currency'
import type firebase from 'firebase'

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
  status: boolean
  account: firebase.firestore.DocumentReference | null
  category: firebase.firestore.DocumentReference | string
  modifier: ValueModifier
  values: number[] // 1 element for each month (12 elements in total); float
  currency?: Currency // EUR by defaul
  date: firebase.firestore.Timestamp
}

type InputAgendaRow = Omit<AgendaRow, 'date' | 'category' | 'account'> & {
  date: dayjs.Dayjs
  category: string
  account: string | null
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
  computed: {
    tooltip: string
    usage: string
    ratio: {
      color: string
      value: number
    }
  }
}
type InputCategory = Omit<Category, 'balance' | 'budget' | 'computed'> & {
  balance: string
  budget: string
}

interface Operation extends FirestoreData {
  name: string
  amount: number // float
  category: firebase.firestore.DocumentReference | null
  modifier: ValueModifier
  createdAt: firebase.firestore.Timestamp
  updatedAt?: firebase.firestore.Timestamp
  date: firebase.firestore.Timestamp
}
type InputOperation = Omit<Operation, 'amount' | 'category' | 'date'> & {
  amount: string
  category: string | firebase.firestore.DocumentReference | null
  date: dayjs.Dayjs
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
  resetDate: dayjs.Dayjs
}
