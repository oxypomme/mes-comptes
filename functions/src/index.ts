import { firestore, initializeApp } from 'firebase-admin'
import {
  Change,
  EventContext,
  firestore as firefnc,
  pubsub,
} from 'firebase-functions'

initializeApp()
const store = firestore()

const resetCategoriesBalance = async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: Date
) => {
  if (
    d > ((await ref.get()).get('resetDate') as firestore.Timestamp).toDate()
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

const checkUsers = async () => {
  const d = new Date()
  const users = await store.collection('users').listDocuments()
  Promise.all([
    ...users.map(async (ref) => {
      await resetCategoriesBalance(ref, d)
    }),
  ])

  return null
}

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

export const scheduledFunction = pubsub
  .schedule('every 24 hours')
  // .schedule('every 30 seconds')
  .onRun(checkUsers)

export const syncBalance = firefnc
  .document('users/{userId}/accounts/{accountId}/operations/{operationId}')
  .onWrite(onOperationWrite)
