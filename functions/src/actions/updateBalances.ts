import { firestore } from 'firebase-admin'
import { Change, EventContext, firestore as firefnc } from 'firebase-functions'

/**
 * Update balances on a new operation
 *
 * @param changes The changes of the document
 * @param context The context of the event
 */
export default async (
  { after, before }: Change<firefnc.DocumentSnapshot>,
  { params }: EventContext
) => {
  const promises = []
  const amount = {
    old: before.data()?.amount ?? 0,
    new: after.data()?.amount ?? 0,
  }
  // Update old category balance
  if (before.exists && (amount.old || before.data()?.category)) {
    const ref = before.data()
      ?.category as firestore.DocumentReference<firestore.DocumentData>
    if (ref) {
      promises.push(
        ref.set(
          {
            balance: firestore.FieldValue.increment(amount.old),
          },
          { merge: true }
        )
      )
    }
  }
  // Update new category balance
  if (after.exists && (amount.new || after.data()?.category)) {
    const ref = after.data()
      ?.category as firestore.DocumentReference<firestore.DocumentData>
    if (ref) {
      promises.push(
        ref.set(
          {
            balance: firestore.FieldValue.increment(-amount.new),
          },
          { merge: true }
        )
      )
    }
  }
  // Update counts & account balance
  const ref = before.ref.firestore.doc(
    `users/${params.userId}/accounts/${params.accountId}`
  )
  const data: {
    balance?: firestore.FieldValue
    operationCount?: firestore.FieldValue
  } = {}
  if ((amount.old || amount.new) && amount.old - amount.new !== 0) {
    data.balance = firestore.FieldValue.increment(amount.new - amount.old)
  }
  let inc = 0
  if (before.exists && !after.exists) {
    // Deletion
    inc = -1
  } else if (!before.exists && after.exists) {
    // Creation
    inc = 1
  }
  if (inc) {
    data.operationCount = firestore.FieldValue.increment(inc)
  }
  promises.push(ref.set(data, { merge: true }))

  await Promise.all(promises)
  return null
}
