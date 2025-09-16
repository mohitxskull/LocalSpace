import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import mail from '@adonisjs/mail/services/main'
import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import VerifyEmailNotification from '#mails/verify_email_notification'
import tokenService from '#services/token_service'
import { tokenTypeE } from '#types/literals'
import CredentialVerification from '#models/credential_verification'
import Token from '#models/token'

test.group('Customer auth', (group) => {
  group.each.setup(async () => {
    await UserFactory.create()
  })

  group.each.teardown(() => {
    mail.restore()
  })

  test('should sign up a new user', async ({ client, assert }) => {
    const password = 'password'
    const userEmail = 'test@gmail.com'
    const name = 'test'

    const { mails } = mail.fake()

    const response = await client.post('/api/v1/customer/auth/sign-up').json({
      name,
      email: userEmail,
      password,
      confirmPassword: password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message:
        'A confirmation link has been sent to your email. Please check your inbox to complete your registration.',
      meta: {
        email: {
          verificationRequired: true,
        },
      },
    })

    const credential = await Credential.query()
      .where(dbRef.credential.identifierC, userEmail)
      .first()
    assert.exists(credential)

    mails.assertQueued(VerifyEmailNotification, (email) => {
      email.message.assertTo(userEmail)
      assert.deepEqual(email.subject, 'Verify your email')
      return true
    })
  })

  test('should return error if email already exists', async ({ client }) => {
    const userEmail = 'test2@gmail.com'

    await UserFactory.with('credentials', 1, (cred) =>
      cred.merge({ identifier: userEmail })
    ).create()

    const response = await client.post('/api/v1/customer/auth/sign-up').json({
      name: 'test',
      email: userEmail,
      password: 'password',
      confirmPassword: 'password',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      code: 'E_BAD_REQUEST',
      message: 'Email already exists.',
      source: 'email',
    })
  })

  test('should sign in a verified user with correct credentials', async ({ client, assert }) => {
    const password = 'password'
    const userEmail = 'verified@gmail.com'

    await UserFactory.with('credentials', 1, (cred) =>
      cred.merge({ identifier: userEmail, password }).with('verification', 1)
    ).create()

    const response = await client.post('/api/v1/customer/auth/sign-in').json({
      email: userEmail,
      password: password,
    })

    response.assertStatus(200)

    const body = response.body()
    assert.isObject(body.token)
    assert.equal(body.token.type, 'bearer')
    assert.isString(body.token.value)
    assert.isString(body.token.expiresAt)
    assert.equal(body.message, 'You have successfully signed in!')
  })

  test('should not sign in a user with incorrect credentials', async ({ client }) => {
    const password = 'password'
    const userEmail = 'verified2@gmail.com'

    await UserFactory.with('credentials', 1, (cred) =>
      cred.merge({ identifier: userEmail, password }).with('verification', 1)
    ).create()

    const response = await client.post('/api/v1/customer/auth/sign-in').json({
      email: userEmail,
      password: 'wrong-password',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      code: 'E_BAD_REQUEST',
      message: 'Invalid credentials',
      source: 'email',
    })
  })

  test('should not sign in an unverified user', async ({ client }) => {
    const password = 'password'
    const userEmail = 'unverified@gmail.com'

    await UserFactory.with('credentials', 1, (cred) =>
      cred.merge({ identifier: userEmail, password })
    ).create()

    const response = await client.post('/api/v1/customer/auth/sign-in').json({
      email: userEmail,
      password: password,
    })

    response.assertStatus(400)
    response.assertBodyContains({
      code: 'EMAIL_NOT_VERIFIED',
      message:
        'A confirmation link has been sent to your email. Please check your inbox to verify your email and complete your registration.',
      source: 'email',
    })
  })

  test('should verify user email with a valid token', async ({ client, assert }) => {
    const user = await UserFactory.with('credentials', 1).create()
    const credential = user.credentials[0]

    const verificationToken = await tokenService.create({
      user,
      type: tokenTypeE('email_verification'),
      expiresIn: '15m',
    })

    const response = await client.post('/api/v1/customer/auth/verify').json({
      token: verificationToken.getValueOrFail().release(),
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Email verified successfully!',
    })

    const credentialVerification = await CredentialVerification.find(credential.id)
    assert.isNotNull(credentialVerification)
    assert.isNotNull(credentialVerification!.verifiedAt)

    const tokenInDb = await Token.find(verificationToken.identifier)
    assert.isNull(tokenInDb)
  })

  test('should return error for invalid verification token', async ({ client }) => {
    const response = await client.post('/api/v1/customer/auth/verify').json({
      token: 'invalid-token',
    })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Invalid verification token',
    })
  })

  test('should return error if email is already verified', async ({ client }) => {
    const user = await UserFactory.with('credentials', 1, (cred) =>
      cred.with('verification', 1)
    ).create()

    const verificationToken = await tokenService.create({
      user,
      type: tokenTypeE('email_verification'),
      expiresIn: '15m',
    })

    const response = await client.post('/api/v1/customer/auth/verify').json({
      token: verificationToken.getValueOrFail().release(),
    })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'Email already verified',
    })
  })
})
