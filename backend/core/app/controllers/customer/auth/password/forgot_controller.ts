import { dbRef } from '#database/reference'
import User from '#models/user'
import { tokenTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import tokenService from '#services/token_service'
import mail from '@adonisjs/mail/services/main'
import PasswordResetNotification from '#mails/password_reset_notification'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(input)

    const user = await User.query().where(dbRef.user.email, payload.email).first()

    const setting = getSetting()

    if (user) {
      const accessTokenHolder = await tokenService.create(
        {
          type: tokenTypeE('password_reset'),
          user: user,
          expiresIn: setting.credential.email.passwordReset.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await mail.sendLater(
        new PasswordResetNotification({
          user: user,
          accessTokenHolder,
        })
      )
    }

    return {
      message: 'If an account with this email exists, a password reset link has been sent.',
    }
  }
}
