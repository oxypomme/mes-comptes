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
  user: firestore.DocumentSnapshot<firestore.DocumentData>,
  d: Date
) => {
  if (d > (user.get('resetDate') as firestore.Timestamp).toDate()) {
    const nd = new Date(d)
    nd.setMonth(d.getMonth() + 1)
    user.ref.set(
      {
        resetDate: firestore.Timestamp.fromDate(nd),
      },
      { merge: true }
    )
    const accounts = await user.ref.collection('accounts').listDocuments()
    for (const adoc of accounts) {
      const categories = await adoc.collection('categories').listDocuments()
      for (const cdoc of categories) {
        cdoc.set(
          {
            balance: 0,
          },
          { merge: true }
        )
      }
    }
  }
}

const checkUsers = async () => {
  const d = new Date()
  const users = await store.collection('users').listDocuments()
  for (const udoc of users) {
    const user = await udoc.get()
    resetCategoriesBalance(user, d)
  }

  return null
}

const onOperationWrite = async (
  { after, before }: Change<firefnc.DocumentSnapshot>,
  { params }: EventContext
) => {
  const aref = before.ref.firestore.doc(
    `users/${params.userId}/accounts/${params.accountId}`
  )
  const amount = {
    old: before.data()?.amount ?? 0,
    new: after.data()?.amount ?? 0,
  }
  // Update account balance
  if (amount.old || amount.new) {
    if (amount.old - amount.new !== 0) {
      await aref.set(
        {
          balance: firestore.FieldValue.increment(amount.new - amount.old),
        },
        { merge: true }
      )
    }
  }
  // Update old category balance
  if (before.exists && (amount.old || before.data()?.category)) {
    const ref = before.data()
      ?.category as firestore.DocumentReference<firestore.DocumentData>
    if (ref) {
      ref.set(
        {
          balance: firestore.FieldValue.increment(amount.old),
        },
        { merge: true }
      )
    }
  }
  // Update new category balance
  if (after.exists && (amount.new || after.data()?.category)) {
    const ref = after.data()
      ?.category as firestore.DocumentReference<firestore.DocumentData>
    if (ref) {
      ref.set(
        {
          balance: firestore.FieldValue.increment(-amount.new),
        },
        { merge: true }
      )
    }
  }
  // Update counts
  if (before.exists && !after.exists) {
    // Deletion
    aref.set(
      {
        operationCount: firestore.FieldValue.increment(-1),
      },
      { merge: true }
    )
  } else if (!before.exists && after.exists) {
    // Creation
    aref.set(
      {
        operationCount: firestore.FieldValue.increment(1),
      },
      { merge: true }
    )
  }

  return null
}

export const scheduledFunction = pubsub
  .schedule('every 24 hours')
  // .schedule('every 30 seconds')
  .onRun(checkUsers)

export const syncBalance = firefnc
  .document('users/{userId}/accounts/{accountId}/operations/{operationId}')
  .onWrite(onOperationWrite)
