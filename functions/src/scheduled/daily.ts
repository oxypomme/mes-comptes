import checkUsers from '../actions/checkUsers'
import { region } from '../firebase'

const schedule = region.pubsub.schedule('every day 23:00')

export const dailyUserCheck = schedule.onRun(checkUsers)
