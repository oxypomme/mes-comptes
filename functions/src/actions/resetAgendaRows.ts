import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'

/**
 * Reset user's agenda's rows if needed
 *
 * @param ref The user reference
 * @param d The current date
 * @param rD The reset date of user before any action running
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs,
  rD: dayjs.Dayjs
) => {
  if (d.isAfter(rD)) {
    return await ref.firestore.runTransaction(async (transaction) => {
      const docs = transaction.getAll(
        ...(await ref.collection('agenda').listDocuments())
      )
      for (const doc of await docs) {
        const aDate = doc.data()?.date as firestore.Timestamp | null
        let nd = dayjs(d)
        if (aDate) {
          // Update date with next month
          nd = dayjs(aDate.toDate())
        }
        transaction.update(doc.ref, {
          status: false,
          date: firestore.Timestamp.fromDate(nd.add(1, 'month').toDate()),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      }
    })
  }
  return
}
