import type { firestore } from 'firebase-admin'
import dayjs from './dayjs'

export type Period = {
  start: dayjs.Dayjs
  end: dayjs.Dayjs
}

export type FirePeriod = {
  start: firestore.Timestamp
  end: firestore.Timestamp
}

export const getCurrentMonth = (activePeriod?: Period, utc = false) => {
  // Parse period
  let period = activePeriod
  if (!period) {
    const today = utc ? dayjs().utc() : dayjs()
    period = {
      start: today.startOf('month'),
      end: today.endOf('month'),
    }
  }

  // Used to calc nuber of month within period
  const extendedPeriod = {
    start: period.start.startOf('month'),
    end: period.end.endOf('month'),
  }

  // Get longer month within period
  const max = {
    month: utc ? dayjs().utc() : dayjs(),
    days: 0,
  }
  for (
    let i = 0;
    i <= extendedPeriod.end.diff(extendedPeriod.start, 'months');
    i++
  ) {
    const curr = period.start.add(i, 'month')
    const limitedCurr = {
      start: dayjs.max(curr.startOf('month'), period.start),
      end: dayjs.min(curr.endOf('month'), period.end),
    }

    const days = limitedCurr.end.diff(limitedCurr.start, 'days') + 1
    if (days > max.days) {
      max.month = curr
      max.days = days
    }
  }

  return {
    label: max.month.format('MMMM'),
    value: max.month.month(),
  }
}

export const calcNextPeriod = (period: Period) => {
  const newStart = period.end.add(1, 'day')
  let duration = period.end.diff(period.start, 'days')
  if (period.start.month() !== period.end.month() && duration === 29) {
    duration += 1
  }
  return {
    start: newStart,
    end: newStart.add(duration, 'days'),
    duration,
  }
}
