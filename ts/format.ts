/**
 * Shorthand for `x.toLocaleString`
 *
 * @param x The number
 * @param options Additional options
 * @returns Formated number
 */
export const toLS = (
  x: number,
  currency = 'EUR',
  options: Omit<Intl.NumberFormatOptions, 'currency'> = {}
): string =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency,
    ...options,
  })

// TODO: use lib insteadd of custom one
const tagsToReplace: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
}
export const escapeHTML = (value?: string) => {
  if (value) {
    return value.replace(/[&<>]/g, (tag) => {
      return tagsToReplace[tag] || tag
    })
  }
  return value
}

export const parseBudget = (
  exp: string,
  nbResetDayInMonth: number,
  nbWeekInMonth: number
): number => {
  try {
    // eslint-disable-next-line no-new-func
    const v = new Function(
      'nbResetDayInMonth',
      'nbWeekInMonth',
      `"use strict"; return ${exp}`
    )(nbResetDayInMonth, nbWeekInMonth) as number
    return v
  } catch (error) {
    return NaN
  }
}
