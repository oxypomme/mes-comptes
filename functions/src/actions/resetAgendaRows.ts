import { firestore } from 'firebase-admin'

/**
 * Reset user's agenda's rows if needed
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
    return ref.firestore.runTransaction(async (transaction) => {
      for (const aRef of await ref.collection('agenda').listDocuments()) {
        const aDate = (await aRef.get()).data()
          ?.date as firestore.Timestamp | null
        if (aDate) {
          // Update date with next month
          const od = aDate.toDate()
          const nd = new Date(od)
          nd.setMonth(od.getMonth() + 1)

          transaction.update(aRef, {
            status: false,
            date: firestore.Timestamp.fromDate(nd),
            updatedAt: firestore.FieldValue.serverTimestamp(),
          })
        }
      }
    })
  }
  return null
}
