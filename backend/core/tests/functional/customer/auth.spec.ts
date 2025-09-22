import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import mail from '@adonisjs/mail/services/main'
import { dbRef } from '#database/reference'
import VerifyEmailNotification from '#mails/verify_email_notification'
import tokenService from '#services/token_service'
import { tokenTypeE } from '#types/literals'
import Token from '#models/token'
import User from '#models/user'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Workspace from '#models/workspace'
import app from '@adonisjs/core/services/app'

test.group('Customer auth', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
    app.config.set('setting.customer.signIn.active', true)
  })

  group.each.teardown(() => {
    mail.restore()
  })

  test('should sign up a new user', async ({ client, assert }) => {
    const password = 'password'
    const userEmail = 'test@gmail.com'
    const name = 'test'

    const { mails } = mail.fake()

    const response = await client.post('/api/v1/customer/auth/signup').json({
      name,
      email: userEmail,
      password,
      confirmPassword: password,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Your account has been created. Please check your email to verify your account.',
      meta: {
        email: {
          verificationRequired: true,
        },
      },
    })

    const user = await User.query().where(dbRef.user.email, userEmail).first()
    assert.exists(user)

    const workspace = await Workspace.query().where('name', `${user!.name}'s Workspace`).first()
    assert.exists(workspace)

    const workspaceMember = await workspace!
      .related('members')
      .query()
      .where('user_id', user!.id)
      .first()
    assert.exists(workspaceMember)
    assert.equal(workspaceMember!.role, 'owner')

    mails.assertQueued(VerifyEmailNotification, (email) => {
      email.message.assertTo(userEmail)
      assert.deepEqual(email.subject, 'Verify your email')
      return true
    })
  })

  test('should return error if email already exists', async ({ client }) => {
    const userEmail = 'test2@gmail.com'

    await UserFactory.merge({ email: userEmail }).create()

    const response = await client.post('/api/v1/customer/auth/signup').json({
      name: 'test',
      email: userEmail,
      password: 'password',
      confirmPassword: 'password',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'An account with this email address already exists.',
      source: 'email',
    })
  })

  test('should sign in a verified user with correct credentials', async ({ client, assert }) => {
    const password = 'password'
    const userEmail = 'verified@gmail.com'

    await UserFactory.merge({
      email: userEmail,
      password: password,
      verifiedAt: DateTime.now(),
    }).create()

    const response = await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: password,
    })

    response.assertStatus(200)

    const body = response.body()
    assert.isObject(body.token)
    assert.equal(body.token.type, 'bearer')
    assert.isString(body.token.value)
    assert.isString(body.token.expiresAt)
    assert.equal(body.message, 'You have been signed in successfully.')
  })

  test('should not sign in a user with incorrect credentials', async ({ client }) => {
    const password = 'password'
    const userEmail = 'verified2@gmail.com'

    await UserFactory.merge({
      email: userEmail,
      password: password,
      verifiedAt: DateTime.now(),
    }).create()

    const response = await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: 'wrong-password',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      message: 'Invalid email or password.',
      source: 'email',
    })
  })

  test('should not sign in an unverified user', async ({ client }) => {
    const password = 'password'
    const userEmail = 'unverified-signin@gmail.com'

    await UserFactory.merge({ email: userEmail, password: password }).create()

    const response = await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: password,
    })

    response.assertStatus(400)
    response.assertBodyContains({
      code: 'EMAIL_NOT_VERIFIED',
      message:
        'Your email address is not verified. Please check your inbox for a verification link.',
      source: 'email',
    })
  })

  test('should verify user email with a valid token', async ({ client, assert }) => {
    const user = await UserFactory.create()

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
      message: 'Your email address has been verified successfully.',
    })

    await user.refresh()
    assert.isNotNull(user.verifiedAt)

    const tokenInDb = await Token.find(verificationToken.identifier)
    assert.isNull(tokenInDb)
  })

  test('should return error for invalid verification token', async ({ client }) => {
    const response = await client.post('/api/v1/customer/auth/verify').json({
      token: 'invalid-token',
    })

    response.assertStatus(403)
    response.assertBodyContains({
      message: 'The verification link is invalid or has expired.',
    })
  })

  test('should return error if email is already verified', async ({ client }) => {
    const user = await UserFactory.merge({ verifiedAt: DateTime.now() }).create()

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
      message: 'Your email address has already been verified.',
    })
  })

  test('should get user profile when authenticated', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client.get('/api/v1/customer/auth/profile').loginAs(user)

    response.assertStatus(200)
    assert.equal(response.body().user.id, user.id)
    assert.equal(response.body().user.email, user.email)
  })

  test('should resend verification email', async ({ client }) => {
    const user = await UserFactory.merge({ email: 'resend@gmail.com' }).create()
    const { mails } = mail.fake()

    const response = await client.post('/api/v1/customer/auth/verify/resend').json({
      email: user.email,
    })

    response.assertStatus(200)

    mails.assertQueued(VerifyEmailNotification, (email) => {
      email.message.assertTo(user.email)
      return true
    })
  })

  test('should not allow sign up if disabled', async ({ client }) => {
    app.config.set('setting.customer.signUp.active', false)

    const response = await client.post('/api/v1/customer/auth/signup').json({
      name: 'test',
      email: 'test@gmail.com',
      password: 'password',
      confirmPassword: 'password',
    })

    response.assertStatus(403)
    response.assertBodyContains({ message: 'signup is currently disabled.' })
  })

  test('should not sign in if signin is disabled', async ({ client }) => {
    app.config.set('setting.customer.signIn.active', false)

    const response = await client.post('/api/v1/customer/auth/signin').json({
      email: 'test@gmail.com',
      password: 'password',
    })

    response.assertStatus(403)
    response.assertBodyContains({ message: 'signin is currently disabled.' })
  })

  test('should rate limit signin attempts', async ({ client }) => {
    const userEmail = 'rate-limit@gmail.com'
    const password = 'password'

    await UserFactory.merge({
      email: userEmail,
      password: password,
      verifiedAt: DateTime.now(),
    }).create()

    const promises = []
    for (let i = 0; i < 6; i++) {
      promises.push(
        client.post('/api/v1/customer/auth/signin').json({
          email: userEmail,
          password: 'wrong-password',
        })
      )
    }

    const responses = await Promise.all(promises)

    const lastResponse = responses[5]
    lastResponse.assertStatus(429)
  }).timeout(10000)

  test('should enforce session limit', async ({ client, assert }) => {
    const password = 'password'
    const userEmail = 'session-limit@gmail.com'

    const user = await UserFactory.merge({
      email: userEmail,
      password: password,
      verifiedAt: DateTime.now(),
    }).create()

    // Log in 3 times
    await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: password,
    })
    await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: password,
    })
    await client.post('/api/v1/customer/auth/signin').json({
      email: userEmail,
      password: password,
    })

    const tokens = await Token.query().where('tokenableId', user.id).andWhere('type', 'access')
    assert.lengthOf(tokens, 2)
  })
})
