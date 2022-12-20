import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'

/**
 * Purge unused devices
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs
) => {
  const limit = d.subtract(1, 'month')
  return ref.firestore.runTransaction(async (transaction) => {
    const docs = transaction.getAll(
      ...(await ref.collection('devices').listDocuments())
    )
    for (const doc of await docs) {
      const dDate = doc.data()?.lastUsed as firestore.Timestamp | null
      if (dDate && dayjs(dDate.toDate()).isBefore(limit)) {
        transaction.delete(doc.ref)
      }
    }
  })
}
