import { firestore } from 'firebase-admin'
import { Change, EventContext, firestore as firefnc } from 'firebase-functions'

/**
 * Update balances on a new operation
 *
 * @param changes The changes of the document
 * @param context The context of the event
 */
export default (
  { after, before }: Change<firefnc.DocumentSnapshot>,
  { params }: EventContext
) => {
  const dataBefore = before.data()
  const dataAfter = after.data()

  const amount = {
    old: dataBefore?.amount ?? 0,
    new: dataAfter?.amount ?? 0,
  }

  const batch = after.ref.firestore.batch()

  // Update old category balance
  if (before.exists && (amount.old || dataBefore?.category)) {
    const ref: firestore.DocumentReference<firestore.DocumentData> | null =
      dataBefore?.category
    if (ref) {
      batch.update(ref, {
        balance: firestore.FieldValue.increment(amount.old),
      })
    }
  }

  // Update new category balance
  if (after.exists && (amount.new || dataAfter?.category)) {
    const ref: firestore.DocumentReference<firestore.DocumentData> | null =
      dataAfter?.category
    if (ref) {
      batch.update(ref, {
        balance: firestore.FieldValue.increment(-amount.new),
      })
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
  batch.update(ref, data)

  return batch.commit()
}
