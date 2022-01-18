import base64url from 'base64url'

const API = ''

export const registerCredential = async () => {
  const opts = {
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      requireResidentKey: false,
    },
  }

  const options = await (
    await fetch(`${API}/auth/registerRequest`, {
      method: 'POST',
      body: JSON.stringify(opts),
    })
  ).json()

  options.user.id = base64url.decode(options.user.id)
  options.challenge = base64url.decode(options.challenge)

  if (options.excludeCredentials) {
    for (const cred of options.excludeCredentials) {
      cred.id = base64url.decode(cred.id)
    }
  }

  const cred = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential
  if (cred) {
    const credential = {
      id: cred.id,
      // rawId: base64url.encode(cred.rawId),
      type: cred.type,
      response: cred.response
        ? {
            // clientDataJSON: base64url.encode(cred.response.clientDataJSON),
            // attestationObject: base64url.encode(cred.response.attestationObject),
          }
        : undefined,
    }

    localStorage.setItem(`credId`, credential.id)

    return await (
      await fetch(`${API}/auth/registerResponse`, {
        method: 'POST',
        body: JSON.stringify(credential),
      })
    ).json()
  }
}

export const unregisterCredential = async (credId: string) => {
  localStorage.removeItem('credId')

  return (
    await fetch(`${API}/auth/removeKey?credId=${encodeURIComponent(credId)}`)
  ).json()
}
