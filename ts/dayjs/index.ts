/* eslint-disable import/no-named-as-default-member */
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import minMax from 'dayjs/plugin/minMax'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import toFire from './toFire'
import 'dayjs/locale/fr'

dayjs.extend(updateLocale)
dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(toFire)

dayjs.locale('fr')
dayjs.updateLocale('fr', {
  months: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
})

export default dayjs
