/* eslint-disable import/no-named-as-default-member */
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import updateLocale from 'dayjs/plugin/updateLocale'
import isBetween from 'dayjs/plugin/isBetween'
import toFire from './toFire'
import 'dayjs/locale/fr'

dayjs.extend(updateLocale)
dayjs.extend(customParseFormat)
dayjs.extend(isBetween)
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
