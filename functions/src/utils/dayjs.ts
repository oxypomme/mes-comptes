import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import utc from 'dayjs/plugin/utc'

dayjs.extend(minMax)
dayjs.extend(utc)

export default dayjs
