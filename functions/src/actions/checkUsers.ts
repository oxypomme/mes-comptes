import dayjs from 'dayjs'
import { store } from '../firebase'
import type { FirePeriod } from '../utils/period'
import autoAgendaRows from './autoAgendaRows'
import purgeOldDevices from './purgeOldDevices'
import resetAgendaRows from './resetAgendaRows'
import resetCategoriesBalance from './resetCategoriesBalance'

/**
 * Check every user if an action is needed
 */
export default async () => {
  const now = dayjs()
  const users = await store().collection('users').listDocuments()

  return Promise.all(
    users.map(async (ref) => {
      const activePeriod: FirePeriod = (await ref.get()).get('activePeriod')
      const period = {
        start: dayjs(activePeriod.start.toDate()).set('hour', 0),
        end: dayjs(activePeriod.end.toDate()).set('hour', 0),
      }

      return Promise.all([
        resetAgendaRows(ref, now, period),
        resetCategoriesBalance(ref, now, period),
        purgeOldDevices(ref, now),
        autoAgendaRows(ref, now, period),
      ])
    })
  )
}
