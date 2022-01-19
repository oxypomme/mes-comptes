import { firestore } from 'firebase-admin'
import {
  Change,
  EventContext,
  firestore as firefnc,
  region,
} from 'firebase-functions'
import { store } from './firebase'

/**
 * Reset user's categories' balances if needed
 *
 * @param ref The user reference
 * @param d The current date
 */
const resetCategoriesBalance = async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: Date
) => {
  if (
    d >= ((await ref.get()).get('resetDate') as firestore.Timestamp).toDate()
  ) {
    const nd = new Date(d)
    nd.setMonth(d.getMonth() + 1)
    await ref.set(
      {
        resetDate: firestore.Timestamp.fromDate(nd),
      },
      { merge: true }
    )
    await Promise.all(
      // for (cosnt aref of await ref.collection('accounts').listDocuments())
      (
        await ref.collection('accounts').listDocuments()
      ).map(async (aref) => {
        // for (cosnt cref of await aref.collection('categories').listDocuments())
        return Promise.all(
          (await aref.collection('categories').listDocuments()).map((cref) => {
            return cref.set(
              {
                balance: 0,
              },
              { merge: true }
            )
          })
        )
      })
    )
  }
}

/**
 * Check every user if an action is needed
 */
const checkUsers = async () => {
  const d = new Date()
  const users = await store().collection('users').listDocuments()
  Promise.all([
    ...users.map(async (ref) => {
      await resetCategoriesBalance(ref, d)
    }),
  ])

  return null
}

/**
 * Update balances on a new operation
 *
 * @param changes The changes of the document
 * @param context The context of the event
 */
const onOperationWrite = async (
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

/**
 * Check users every 24 hours
 */
export const scheduledFunction = region('europe-west1')
  .pubsub.schedule('every 24 hours')
  // .schedule('every 30 seconds')
  .onRun(checkUsers)

/**
 * Trigger balance update on new operation
 */
export const syncBalance = region('europe-west1')
  .firestore.document(
    'users/{userId}/accounts/{accountId}/operations/{operationId}'
  )
  .onWrite(onOperationWrite)
