import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'

/**
 * Reset user's categories' balances if needed
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
    const nd = dayjs(d).add(1, 'month')

    const batch = ref.firestore.batch()
    batch.update(ref, {
      resetDate: firestore.Timestamp.fromDate(nd.toDate()),
    })
    for (const aref of await ref.collection('accounts').listDocuments()) {
      for (const cref of await aref.collection('categories').listDocuments()) {
        batch.update(cref, {
          balance: 0,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      }
    }
    return batch.commit()
  }
  return null
}
