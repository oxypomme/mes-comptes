/**
 * Shorthand for `x.toLocaleString`
 *
 * @param x The number
 * @param options Additional options
 * @returns Formated number
 */
export const toLS = (
  x: number,
  options: Intl.NumberFormatOptions = {}
): string =>
  x.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency: 'EUR',
    ...options,
  })

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
