import schedules from '../utils/schedules'
import checkUsers from '../actions/checkUsers'
import { region } from '../firebase'

const schedule = region.pubsub.schedule(`every day ${schedules.daily}`)

export const dailyUserCheck = schedule.onRun(checkUsers)
