import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { fcm } from '../firebase'
import { convert } from '../utils/currency'
import { getCurrentMonth, Period } from '../utils/period'

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
    for (const row of await rows) {
      const data = row.data()
      const rowDate = data?.date as firestore.Timestamp | null

      if (
        rowDate &&
        dayjs.utc(rowDate.toDate()).isBefore(d) &&
        data?.account &&
        data.category &&
        !data.status
      ) {
        const opeRef = data.account.collection('operations').doc()

        let opeValue = data.values[current.value]
        if (data.currency && data.currency !== 'EUR') {
          try {
            opeValue = await convert(opeValue, data.currency, 'EUR')
          } catch (error) {}
        }

        const ope = {
          amount: data.modifier * opeValue,
          name: `${data.name} - ${current.label}`,
        }

        if (ope.amount) {
          // Adding 1 month because agenda is in month and not in period
          const newRowDate = dayjs.utc(rowDate.toDate()).add(1, 'month')

          transaction
            .create(opeRef, {
              ...ope,
              date: rowDate,
              category: data.category,
              createdAt: firestore.FieldValue.serverTimestamp(),
            })
            .update(row.ref, {
              date: firestore.Timestamp.fromDate(newRowDate.toDate()),
              status: true,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            })

          if (tokens && tokens.length > 0) {
            await fcm().sendMulticast({
              tokens,
              notification: {
                title: '\uD83D\uDCC5 Une nouvelle opération vous attend !',
                body: `L'opération "${
                  data.name
                }" avec une valeur de ${ope.amount.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                  style: 'currency',
                  currency: 'EUR',
                })} a été automatiquement ajoutée.`,
              },
            })
          }
        }
      }
    }
    return true
  })
}
