import { firestore } from 'firebase-admin'

/**
 * Reset user's categories' balances if needed
 *
 * @param ref The user reference
 * @param d The current date
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: Date
) => {
  if (
    d >= ((await ref.get()).get('resetDate') as firestore.Timestamp).toDate()
  ) {
    const nd = new Date(d)
    nd.setMonth(d.getMonth() + 1)

    const batch = ref.firestore.batch()
    batch.update(ref, {
      resetDate: firestore.Timestamp.fromDate(nd),
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
