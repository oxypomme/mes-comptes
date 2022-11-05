import dayjs from 'dayjs'
import type { firestore } from 'firebase-admin'
import { store } from '../firebase'
import resetAgendaRows from './resetAgendaRows'
import resetCategoriesBalance from './resetCategoriesBalance'

/**
 * Check every user if an action is needed
 */
export default async () => {
  const today = dayjs()
  const users = await store().collection('users').listDocuments()

  return Promise.all(
    users.map(async (ref) => {
      const resetDate = dayjs(
        ((await ref.get()).get('resetDate') as firestore.Timestamp).toDate()
      )

      await resetAgendaRows(ref, today, resetDate)
      await resetCategoriesBalance(ref, today, resetDate)
    })
  )
}
