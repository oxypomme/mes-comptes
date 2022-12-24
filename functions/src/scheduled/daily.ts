import checkUsers from '../actions/checkUsers'
import { region } from '../firebase'

// ! Keep in sync with components/settings/Info !
const schedule = region.pubsub.schedule('every day 23:00')

export const dailyUserCheck = schedule.onRun(checkUsers)
