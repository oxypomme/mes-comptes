import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { fcm } from '../firebase'
import { calcNextPeriod, Period } from '../utils/period'

/**
 * Reset user's categories' balances if needed
 *
 * @param ref The user reference
 * @param d The current date
 * @param p The activePeriod of user before any action running
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs,
  p: Period
) => {
  if (d.isAfter(p.end.add(1, 'day'))) {
    const newPeriod = calcNextPeriod(p)

    const batch = ref.firestore.batch()
    batch.update(ref, {
      activePeriod: {
        start: firestore.Timestamp.fromDate(newPeriod.start.toDate()),
        end: firestore.Timestamp.fromDate(newPeriod.end.toDate()),
      },
    })
    for (const aref of await ref.collection('accounts').listDocuments()) {
      for (const cref of await aref.collection('categories').listDocuments()) {
        batch.update(cref, {
          balance: 0,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })
      }
    }
    await batch.commit()

    const devices = await ref.collection('devices').listDocuments()
    if (devices && devices.length > 0) {
      const tokens = devices.map((d) => d.id)

      await fcm().sendMulticast({
        tokens,
        notification: {
          title: '\uD83D\uDCC5 Nouveau jour, nouveau mois...',
          body: 'Vos budgets ont été remis à zéro. Profitez en pour vous faire plaisir !',
        },
      })
    }
    return true
  }
  return false
}
