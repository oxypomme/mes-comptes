const API_URL = 'https://api.exchangerate.host'

type APISuccess = {
  success: true
  query: Record<string, string | number>
  info: {
    rate: number
  }
  historical: boolean
  date: string
  result: number
}

type APIFail = {
  success: false
}

type APIResult = APISuccess | APIFail

/**
 * Currencies supported by API
 *
 * @see {@link https://exchangerate.host}
 */
export const currencies = {
  EUR: '€',
  USD: '$US',
  GBP: '£GB',
  JPY: 'JPY',
  CNY: 'CNY',
  AUD: '$AU',
  CAD: '$CA',
  CHF: 'CHF',
  HKD: 'HKD',
  SGD: '$SG',
  // AED: 'AED',
  // AFN: 'AFN',
  // ALL: 'ALL',
  // AMD: 'AMD',
  // ANG: 'ANG',
  // AOA: 'AOA',
  // ARS: '$AR',
  // AWG: 'AWG',
  // AZN: 'AZN',
  // BAM: 'BAM',
  // BBD: 'BBD',
  // BDT: 'BDT',
  // BGN: 'BGN',
  // BHD: 'BHD',
  // BIF: 'BIF',
  // BMD: '$BM',
  // BND: '$BN',
  // BOB: 'BOB',
  // BRL: 'R$',
  // BSD: 'BSD',
  // BTC: 'BTC',
  // BTN: 'BTN',
  // BWP: 'BWP',
  // BYN: 'BYN',
  // BZD: '$BZ',
  // CDF: 'CDF',
  // CLF: 'CLF',
  // CLP: '$CL',
  // CNH: 'CNH',
  // COP: '$CO',
  // CRC: 'CRC',
  // CUC: 'CUC',
  // CUP: 'CUP',
  // CVE: 'CVE',
  // CZK: 'CZK',
  // DJF: 'DJF',
  // DKK: 'DKK',
  // DOP: 'DOP',
  // DZD: 'DZD',
  // EGP: 'EGP',
  // ERN: 'ERN',
  // ETB: 'ETB',
  // FJD: '$FJ',
  // FKP: '£FK',
  // GEL: 'GEL',
  // GGP: 'GGP',
  // GHS: 'GHS',
  // GIP: '£GI',
  // GMD: 'GMD',
  // GNF: 'GNF',
  // GTQ: 'GTQ',
  // GYD: 'GYD',
  // HNL: 'HNL',
  // HRK: 'HRK',
  // HTG: 'HTG',
  // HUF: 'HUF',
  // IDR: 'IDR',
  // ILS: '₪',
  // IMP: 'IMP',
  // INR: '₹',
  // IQD: 'IQD',
  // IRR: 'IRR',
  // ISK: 'ISK',
  // JEP: 'JEP',
  // JMD: 'JMD',
  // JOD: 'JOD',
  // KES: 'KES',
  // KGS: 'KGS',
  // KHR: 'KHR',
  // KMF: 'KMF',
  // KPW: 'KPW',
  // KRW: '₩',
  // KWD: 'KWD',
  // KYD: 'KYD',
  // KZT: 'KZT',
  // LAK: 'LAK',
  // LBP: '£LB',
  // LKR: 'LKR',
  // LRD: 'LRD',
  // LSL: 'LSL',
  // LYD: 'LYD',
  // MAD: 'MAD',
  // MDL: 'MDL',
  // MGA: 'MGA',
  // MKD: 'MKD',
  // MMK: 'MMK',
  // MNT: 'MNT',
  // MOP: 'MOP',
  // MRO: 'MRO',
  // MRU: 'MRU',
  // MUR: 'MUR',
  // MVR: 'MVR',
  // MWK: 'MWK',
  // MXN: '$MX',
  // MYR: 'MYR',
  // MZN: 'MZN',
  // NAD: '$NA',
  // NGN: 'NGN',
  // NIO: 'NIO',
  // NOK: 'NOK',
  // NPR: 'NPR',
  // NZD: '$NZ',
  // OMR: 'OMR',
  // PAB: 'PAB',
  // PEN: 'PEN',
  // PGK: 'PGK',
  // PHP: 'PHP',
  // PKR: 'PKR',
  // PLN: 'PLN',
  // PYG: 'PYG',
  // QAR: 'QAR',
  // RON: 'RON',
  // RSD: 'RSD',
  // RUB: 'RUB',
  // RWF: 'RWF',
  // SAR: 'SAR',
  // SBD: '$SB',
  // SCR: 'SCR',
  // SDG: 'SDG',
  // SEK: 'SEK',
  // SHP: 'SHP',
  // SLL: 'SLL',
  // SOS: 'SOS',
  // SRD: '$SR',
  // SSP: 'SSP',
  // STD: 'STD',
  // STN: 'STN',
  // SVC: 'SVC',
  // SYP: 'SYP',
  // SZL: 'SZL',
  // THB: 'THB',
  // TJS: 'TJS',
  // TMT: 'TMT',
  // TND: 'TND',
  // TOP: 'TOP',
  // TRY: 'TRY',
  // TTD: '$TT',
  // TWD: 'TWD',
  // TZS: 'TZS',
  // UAH: 'UAH',
  // UGX: 'UGX',
  // UYU: '$UY',
  // UZS: 'UZS',
  // VEF: 'VEF',
  // VES: 'VES',
  // VND: '₫',
  // VUV: 'VUV',
  // WST: '$WS',
  // XAF: 'FCFA',
  // XAG: 'XAG',
  // XAU: 'XAU',
  // XCD: 'XCD',
  // XDR: 'XDR',
  // XOF: 'F CFA',
  // XPD: 'XPD',
  // XPF: 'FCFP',
  // XPT: 'XPT',
  // YER: 'YER',
  // ZAR: 'ZAR',
  // ZMW: 'ZMW',
  // ZWL: 'ZWL',
} as const
export type Currency = keyof typeof currencies

const cache: Record<string, number> = {}
// const cache: Record<`${Currency}_${Currency}_${number}`, number> = {}

/**
 * Convert amount between currencies
 *
 * @see {@link https://exchangerate.host}
 *
 * @param amount The amount to convert
 * @param to The tagerted currrency
 * @param from The base currency of the amount (`EUR` by default)
 */
export const convert = (
  amount: number,
  from: Currency,
  to: Currency
): number => {
  const cacheKey = `${from}_${to}_${amount}` as keyof typeof cache
  if (cacheKey in cache) {
    return cache[cacheKey]
  }
  const url = new URL(`${API_URL}/convert`)
  url.searchParams.set('amount', amount.toString())
  url.searchParams.set('from', from)
  url.searchParams.set('to', to)

  const request = new XMLHttpRequest()
  request.open('GET', url.toString(), false)
  request.send()

  if (request.status === 200) {
    const result: APIResult = JSON.parse(request.responseText)
    if (result.success) {
      cache[cacheKey] = result.result
      return result.result
    }
    throw result
  }
  throw request
}
