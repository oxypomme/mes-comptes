import https from 'node:https'

export const httpsGet = (url: string, params?: Record<string, string>) => {
  let u = url
  if (params) {
    const p = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    u += `?${p}`
  }

  return new Promise<string>((resolve, reject) => {
    https
      .get(u, (res) => {
        let data = ''
        res.on('data', (d) => {
          data += d
        })
        res.on('end', () => {
          resolve(data)
        })
      })
      .on('error', reject)
  })
}
