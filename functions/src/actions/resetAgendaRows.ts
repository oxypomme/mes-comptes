import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { Period } from '../utils/period'

/**
 * Reset user's agenda's rows if needed
 *
 * @param ref The user reference
 * @param d The current date
 * @param p The activePeriod of user before any action running
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs,
  p: Period
) => {
  if (d.isAfter(p.end.add(1, 'day'))) {
    return await ref.firestore.runTransaction(async (transaction) => {
      const docs = transaction.getAll(
        ...(await ref.collection('agenda').listDocuments())
      )
      for (const doc of await docs) {
        transaction.update(doc.ref, {
          status: false,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      }
      return true
    })
  }
  return false
}
