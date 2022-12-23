import sanitzeHtml from 'sanitize-html'

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

export const escapeHTML = (value?: string) => {
  if (value) {
    return sanitzeHtml(value, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'recursiveEscape',
    })
  }
  return value
}

export const parseBudget = (
  exp: string,
  nbDayInPeriod: () => number,
  nbWeekInPeriod: number
): number => {
  try {
    // eslint-disable-next-line no-new-func
    const v = new Function(
      'nbDayInPeriod',
      'nbWeekInPeriod',
      `"use strict"; return ${exp}`
    )(nbDayInPeriod, nbWeekInPeriod) as number
    return v
  } catch (error) {
    return NaN
  }
}
