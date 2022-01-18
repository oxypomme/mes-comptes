import express from 'express'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import base64url from 'base64url'
import { auth } from 'firebase-admin'
import store from './store'

const app = express()

app.use(express.json())

/**
 * Respond with required information to call navigator.credential.create()
 * Input is passed via `req.body` with similar format as output
 * Output format:
 * ```{
     rp: {
       id: String,
       name: String
     },
     user: {
       displayName: String,
       id: String,
       name: String
     },
     publicKeyCredParams: [{  // @herrjemand
       type: 'public-key', alg: -7
     }],
     timeout: Number,
     challenge: String,
     excludeCredentials: [{
       id: String,
       type: 'public-key',
       transports: [('ble'|'nfc'|'usb'|'internal'), ...]
     }, ...],
     authenticatorSelection: {
       authenticatorAttachment: ('platform'|'cross-platform'),
       requireResidentKey: Boolean,
       userVerification: ('required'|'preferred'|'discouraged')
     },
     attestation: ('none'|'indirect'|'direct')
 * }```
 **/
app.post('/registerRequest', async (req, res) => {
  const { uid } = req.body
  const { email } = await auth().getUser(uid)
  const credentials = await store
    .collection('users')
    .doc(uid)
    .collection('credentials')
    .listDocuments()
  try {
    let excludeCredentials = [] as PublicKeyCredentialDescriptor[]
    if (credentials) {
      excludeCredentials = credentials.map(({ id }) => ({
        id: base64url.toBuffer(id),
        type: 'public-key',
        transports: ['internal'],
      }))
    }
    const pubKeyCredParams = []
    // const params = [-7, -35, -36, -257, -258, -259, -37, -38, -39, -8];
    const params = [-7, -257]
    for (const param of params) {
      pubKeyCredParams.push({ type: 'public-key', alg: param })
    }
    const as = {} as any // authenticatorSelection
    const aa = req.body.authenticatorSelection.authenticatorAttachment
    const rr = req.body.authenticatorSelection.requireResidentKey
    const uv = req.body.authenticatorSelection.userVerification
    const cp = req.body.attestation // attestationConveyancePreference
    let asFlag = false
    let authenticatorSelection
    let attestation = 'none' as AttestationConveyancePreference

    if (aa && (aa === 'platform' || aa === 'cross-platform')) {
      asFlag = true
      as.authenticatorAttachment = aa
    }
    if (rr && typeof rr === 'boolean') {
      asFlag = true
      as.requireResidentKey = rr
    }
    if (
      uv &&
      (uv === 'required' || uv === 'preferred' || uv === 'discouraged')
    ) {
      asFlag = true
      as.userVerification = uv
    }
    if (asFlag) {
      authenticatorSelection = as
    }
    if (cp && (cp === 'none' || cp === 'indirect' || cp === 'direct')) {
      attestation = cp
    }

    const options = generateRegistrationOptions({
      rpName: 'Mes Comptes',
      rpID: req.hostname,
      userID: uid,
      userName: email ?? '',
      // Prompt users for additional information about the authenticator.
      attestationType: attestation,
      // Prevent users from re-registering existing authenticators
      excludeCredentials,
      authenticatorSelection,
    })

    await store.collection('users').doc(uid).set(
      {
        challenge: options.challenge,
      },
      { merge: true }
    )

    // Temporary hack until SimpleWebAuthn supports `pubKeyCredParams`
    options.pubKeyCredParams = []
    for (const param of params) {
      options.pubKeyCredParams.push({ type: 'public-key', alg: param })
    }

    res.json(options)
  } catch (e) {
    res.status(400).send({ error: e })
  }
})

/**
 * Register user credential.
 * Input format:
 * ```{
     id: String,
     type: 'public-key',
     rawId: String,
     response: {
       clientDataJSON: String,
       attestationObject: String,
       signature: String,
       userHandle: String
     }
 * }```
 **/
app.post('/registerResponse', async (req, res) => {
  const { uid, ...body } = req.body
  const expectedChallenge = (
    await store.collection('users').doc(uid).get()
  ).get('challenge')

  try {
    const verification = await verifyRegistrationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: req.hostname,
      expectedRPID: req.hostname,
    })

    const { verified, registrationInfo } = verification

    if (!verified || !registrationInfo) {
      throw new Error('User verification failed.')
    }

    const { credentialPublicKey, credentialID, counter } = registrationInfo
    const base64CredentialID = base64url.encode(credentialID)

    const existingCred = store
      .collection('users')
      .doc(uid)
      .collection('credentials')
      .doc(base64CredentialID)

    if (!(await existingCred.get()).exists) {
      /**
       * Add the returned device to the user's list of devices
       */
      await existingCred.set({
        publicKey: base64url.encode(credentialPublicKey),
        credId: base64CredentialID,
        prevCounter: counter,
      })
    }

    res.json({
      status: 'OK',
    })
  } catch (e) {
    res.status(400).send({ error: (e as Error).message })
  }
})

// TODO: Remove Key

export default app
