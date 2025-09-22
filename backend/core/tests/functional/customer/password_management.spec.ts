import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import mail from '@adonisjs/mail/services/main'
import PasswordResetNotification from '#mails/password_reset_notification'
import tokenService from '#services/token_service'
import { tokenTypeE } from '#types/literals'
import testUtils from '@adonisjs/core/services/test_utils'
import hash from '@adonisjs/core/services/hash'

test.group('Password management', (group) => {
  group.each.setup(async () => {
    await testUtils.db().truncate()
  })

  group.each.teardown(() => {
    mail.restore()
  })

  test('should allow a logged-in user to update their password', async ({ client, assert }) => {
    const oldPassword = 'oldPassword123'
    const newPassword = 'newPassword456'
    const user = await UserFactory.merge({ password: oldPassword }).create()

    const response = await client.post('/api/v1/customer/auth/password/update').loginAs(user).json({
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: newPassword,
    })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Your password has been updated successfully.' })

    await user.refresh()
    const isNewPasswordValid = await hash.verify(user.password, newPassword)
    assert.isTrue(isNewPasswordValid)
  })

  test('should return error if old password is incorrect', async ({ client }) => {
    const oldPassword = 'oldPassword123'
    const newPassword = 'newPassword456'
    const user = await UserFactory.merge({ password: oldPassword }).create()

    const response = await client.post('/api/v1/customer/auth/password/update').loginAs(user).json({
      oldPassword: 'wrongOldPassword',
      newPassword: newPassword,
      confirmNewPassword: newPassword,
    })

    response.assertStatus(400)
    response.assertBodyContains({ message: 'The old password you entered is incorrect.' })
  })

  test('should send a password reset email if user exists', async ({ client, assert }) => {
    const user = await UserFactory.merge({ email: 'forgotpassword@gmail.com' }).create()
    const { mails } = mail.fake()

    const response = await client.post('/api/v1/customer/auth/password/forgot').json({
      email: user.email,
    })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'If an account with this email exists, a password reset link has been sent.',
    })

    mails.assertQueued(PasswordResetNotification, (email) => {
      email.message.assertTo(user.email)
      assert.deepEqual(email.subject, 'Reset your password')
      return true
    })
  })

  test('should not send a password reset email if user does not exist', async ({ client }) => {
    const { mails } = mail.fake()

    const response = await client.post('/api/v1/customer/auth/password/forgot').json({
      email: 'nonexistent@gmail.com',
    })

    response.assertStatus(200)
    mails.assertNoneQueued()
  })

  test('should reset password with a valid token', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const newPassword = 'newSecurePassword'

    const resetToken = await tokenService.create({
      user,
      type: tokenTypeE('password_reset'),
      expiresIn: '15m',
    })

    const response = await client.post('/api/v1/customer/auth/password/reset').json({
      token: resetToken.getValueOrFail().release(),
      newPassword: newPassword,
      confirmNewPassword: newPassword,
    })

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Your password has been successfully reset.' })

    await user.refresh()
    const isNewPasswordValid = await hash.verify(user.password, newPassword)
    assert.isTrue(isNewPasswordValid)
  })

  test('should return error for invalid reset token', async ({ client }) => {
    const newPassword = 'newSecurePassword'

    const response = await client.post('/api/v1/customer/auth/password/reset').json({
      token: 'invalid-token',
      newPassword: newPassword,
      confirmNewPassword: newPassword,
    })

    response.assertStatus(403)
    response.assertBodyContains({ message: 'The provided token is invalid or has expired.' })
  })
})
