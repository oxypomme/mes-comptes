import { httpsGet } from './httpRequest'

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
export type Currency =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'JPY'
  | 'CNY'
  | 'AUD'
  | 'CAD'
  | 'CHF'
  | 'HKD'
  | 'SGD'
// | 'AED'
// | 'AFN'
// | 'ALL'
// | 'AMD'
// | 'ANG'
// | 'AOA'
// | 'ARS'
// | 'AWG'
// | 'AZN'
// | 'BAM'
// | 'BBD'
// | 'BDT'
// | 'BGN'
// | 'BHD'
// | 'BIF'
// | 'BMD'
// | 'BND'
// | 'BOB'
// | 'BRL'
// | 'BSD'
// | 'BTC'
// | 'BTN'
// | 'BWP'
// | 'BYN'
// | 'BZD'
// | 'CDF'
// | 'CLF'
// | 'CLP'
// | 'CNH'
// | 'COP'
// | 'CRC'
// | 'CUC'
// | 'CUP'
// | 'CVE'
// | 'CZK'
// | 'DJF'
// | 'DKK'
// | 'DOP'
// | 'DZD'
// | 'EGP'
// | 'ERN'
// | 'ETB'
// | 'FJD'
// | 'FKP'
// | 'GEL'
// | 'GGP'
// | 'GHS'
// | 'GIP'
// | 'GMD'
// | 'GNF'
// | 'GTQ'
// | 'GYD'
// | 'HNL'
// | 'HRK'
// | 'HTG'
// | 'HUF'
// | 'IDR'
// | 'ILS'
// | 'IMP'
// | 'INR'
// | 'IQD'
// | 'IRR'
// | 'ISK'
// | 'JEP'
// | 'JMD'
// | 'JOD'
// | 'KES'
// | 'KGS'
// | 'KHR'
// | 'KMF'
// | 'KPW'
// | 'KRW'
// | 'KWD'
// | 'KYD'
// | 'KZT'
// | 'LAK'
// | 'LBP'
// | 'LKR'
// | 'LRD'
// | 'LSL'
// | 'LYD'
// | 'MAD'
// | 'MDL'
// | 'MGA'
// | 'MKD'
// | 'MMK'
// | 'MNT'
// | 'MOP'
// | 'MRO'
// | 'MRU'
// | 'MUR'
// | 'MVR'
// | 'MWK'
// | 'MXN'
// | 'MYR'
// | 'MZN'
// | 'NAD'
// | 'NGN'
// | 'NIO'
// | 'NOK'
// | 'NPR'
// | 'NZD'
// | 'OMR'
// | 'PAB'
// | 'PEN'
// | 'PGK'
// | 'PHP'
// | 'PKR'
// | 'PLN'
// | 'PYG'
// | 'QAR'
// | 'RON'
// | 'RSD'
// | 'RUB'
// | 'RWF'
// | 'SAR'
// | 'SBD'
// | 'SCR'
// | 'SDG'
// | 'SEK'
// | 'SHP'
// | 'SLL'
// | 'SOS'
// | 'SRD'
// | 'SSP'
// | 'STD'
// | 'STN'
// | 'SVC'
// | 'SYP'
// | 'SZL'
// | 'THB'
// | 'TJS'
// | 'TMT'
// | 'TND'
// | 'TOP'
// | 'TRY'
// | 'TTD'
// | 'TWD'
// | 'TZS'
// | 'UAH'
// | 'UGX'
// | 'UYU'
// | 'UZS'
// | 'VEF'
// | 'VES'
// | 'VND'
// | 'VUV'
// | 'WST'
// | 'XAF'
// | 'XAG'
// | 'XAU'
// | 'XCD'
// | 'XDR'
// | 'XOF'
// | 'XPD'
// | 'XPF'
// | 'XPT'
// | 'YER'
// | 'ZAR'
// | 'ZMW'
// | 'ZWL'

/**
 * Convert amount between currencies
 *
 * @see {@link https://exchangerate.host}
 *
 * @param amount The amount to convert
 * @param to The tagerted currrency
 * @param from The base currency of the amount (`EUR` by default)
 */
export const convert = async (
  amount: number,
  from: Currency,
  to: Currency
): Promise<number> => {
  const response = await httpsGet(`${API_URL}/convert`, {
    amount: amount.toString(),
    from,
    to,
  })
  const result: APIResult = JSON.parse(response)
  if (result.success) {
    return result.result
  }
  throw result
}
