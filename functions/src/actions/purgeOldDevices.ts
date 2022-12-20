import dayjs from 'dayjs'
import type { firestore } from 'firebase-admin'

/**
 * Purge unused devices
 *
 * @param ref The user reference
 * @param d The current date
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs
) => {
  const limit = d.subtract(1, 'month')
  return ref.firestore.runTransaction(async (transaction) => {
    const devices = transaction.getAll(
      ...(await ref.collection('devices').listDocuments())
    )
    for (const device of await devices) {
      const dDate = device.data()?.lastUsed as firestore.Timestamp | null
      if (dDate && dayjs(dDate.toDate()).isBefore(limit, 'date')) {
        transaction.delete(device.ref)
      }
    }
  })
}
