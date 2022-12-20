import dayjs from 'dayjs'
import { firestore } from 'firebase-admin'
import { fcm } from '../firebase'

/**
 * Add operation that must run today
 *
 * @param ref The user reference
 * @param d The current date
 * @param rD The reset date of user before any action running
 */
export default async (
  ref: firestore.DocumentReference<firestore.DocumentData>,
  d: dayjs.Dayjs,
  rD: dayjs.Dayjs
) => {
  const devices = await ref.collection('devices').listDocuments()
  const tokens = devices?.map((d) => d.id)

  const date = dayjs(rD).subtract(1, 'month')
  const current = {
    label: date.format('MMMM'),
    value: date.month(),
  }

  return ref.firestore.runTransaction(async (transaction) => {
    const rows = transaction.getAll(
      ...(await ref.collection('agenda').listDocuments())
    )
    for (const row of await rows) {
      const data = row.data()
      const rDate = data?.date as firestore.Timestamp | null

      if (
        rDate &&
        dayjs(rDate.toDate()).isBefore(d, 'date') &&
        data?.account &&
        data.category &&
        !data.status
      ) {
        const opeRef = data.account.collection('operations').doc()

        const ope = {
          amount: data.modifier * data.values[current.value],
          name: `${data.name} - ${current.label}`,
        }

        transaction
          .create(opeRef, {
            ...ope,
            date: rDate,
            category: data.category,
            createdAt: firestore.FieldValue.serverTimestamp(),
          })
          .update(row.ref, {
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
    return true
  })
}
