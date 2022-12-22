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
