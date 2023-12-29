import dayjs from 'dayjs'
import type { firestore } from 'firebase-admin'
import { logger } from 'firebase-functions/v1'

/**
 * Purge unused devices
 *
 * @param ref The user reference
 * @param d The current date
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs
) => {
  const limit = d.subtract(1, 'month')
  return ref.firestore.runTransaction(async (transaction) => {
    const devices = transaction.getAll(
      ...((await ref.collection('devices').listDocuments()) ?? [])
    )
    for (const device of await devices) {
      const dDate = device.data()?.lastUsed as firestore.Timestamp | null
      if (dDate && dayjs.utc(dDate.toDate()).isBefore(limit, 'date')) {
        logger.info('Deleting unused device', { device, user: ref.id })
        transaction.delete(device.ref)
      }
    }
  })
}
