import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { fcm } from '../firebase'
import { calcNextPeriod, Period } from '../utils/period'
import { logger } from 'firebase-functions/v1'
import { buildMonthReset } from '../notifications'

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
  if (!d.isAfter(p.end.add(1, 'day'))) {
    return false
  }
  logger.info('Resetting categories...', { user: ref.id })

  try {
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
  } catch (error) {
    logger.error('Error occurred when resetting categories', {
      message: error instanceof Error ? error.message : error,
      user: ref.id,
    })
    return false
  }

  try {
    const devices = await ref.collection('devices').listDocuments()
    if (devices && devices.length > 0) {
      const tokens = devices.map((d) => d.id)

      await fcm().sendMulticast({
        tokens,
        notification: buildMonthReset(),
      })
      logger.info('Multiple MonthResetNotification sent', {
        devices: tokens,
        user: ref.id,
      })
    }
  } catch (error) {
    logger.warn('Error occurred when sending MonthResetNotification', {
      message: error instanceof Error ? error.message : error,
      user: ref.id,
    })
  }

  return true
}
