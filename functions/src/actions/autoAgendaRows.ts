import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { fcm } from '../firebase'
import { convert } from '../utils/currency'
import { getCurrentMonth, Period } from '../utils/period'
import { logger } from 'firebase-functions/v1'
import { buildNewOperation } from '../notifications'

/**
 * Add operation that must run today
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
  const devices = await ref.collection('devices').listDocuments()
  const tokens = devices?.map((d) => d.id)

  const current = getCurrentMonth(p, true)

  return ref.firestore.runTransaction(async (transaction) => {
    const rows = transaction.getAll(
      ...(await ref.collection('agenda').listDocuments())
    )
    try {
      for (const row of await rows) {
        try {
          const data = row.data()
          const rowDate = data?.date as firestore.Timestamp | null

          if (!rowDate || !data?.account || !data.category || data.status) {
            continue
          }

          // Adding 1 month because agenda is in month and not in period
          const newRowDate = dayjs.utc(rowDate.toDate()).add(1, 'month')
          transaction.update(row.ref, {
            date: newRowDate,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          })

          if (!dayjs.utc(rowDate.toDate()).isBefore(d)) {
            continue
          }

          const opeRef = data.account.collection('operations').doc()

          let opeValue = data.values[current.value]
          if (data.currency && data.currency !== 'EUR') {
            try {
              opeValue = await convert(opeValue, data.currency, 'EUR')
            } catch (error) {
              logger.warn('Error occurred when converting currency', {
                message: error instanceof Error ? error.message : error,
                user: ref.id,
              })
            }
          }

          const ope = {
            amount: data.modifier * opeValue,
            name: `${data.name} - ${current.label}`,
          }

          if (!ope.amount) {
            continue
          }

          transaction
            .create(opeRef, {
              ...ope,
              date: rowDate,
              category: data.category,
              createdAt: firestore.FieldValue.serverTimestamp(),
            })
            .update(row.ref, {
              status: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            })
          logger.info('Operation created from row', { row: data, user: ref.id })

          try {
            if (tokens && tokens.length > 0) {
              await fcm().sendMulticast({
                tokens,
                notification: buildNewOperation(data.name, ope.amount),
              })
              logger.info('Multiple NewOperationNotification sent', {
                devices: tokens,
                user: ref.id,
              })
            }
          } catch (error) {
            logger.warn(
              'Error occurred when sending NewOperationNotification',
              {
                message: error instanceof Error ? error.message : error,
                user: ref.id,
              }
            )
          }
        } catch (error) {
          logger.error('Error occurred when adding auto row', {
            message: error instanceof Error ? error.message : error,
            row: row.ref.id,
            user: ref.id,
          })
          throw error
        }
      }
    } catch (error) {
      return false
    }
    return true
  })
}
