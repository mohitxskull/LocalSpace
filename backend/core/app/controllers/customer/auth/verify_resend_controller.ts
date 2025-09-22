import { dbRef } from '#database/reference'
import User from '#models/user'
import { tokenTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import tokenService from '#services/token_service'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const setting = getSetting()
    const payload = await ctx.request.validateUsing(input)

    const user = await User.query()
      .where(dbRef.user.email, payload.email)
      .whereNull(dbRef.user.verifiedAt)
      .first()

    if (user) {
      const accessTokenHolder = await tokenService.create(
        {
          type: tokenTypeE('email_verification'),
          user: user,
          expiresIn: setting.credential.email.verification.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await mail.sendLater(
        new VerifyEmailNotification({
          user: user,
          accessTokenHolder,
        })
      )
    }

    return {
      message:
        'If an unverified account with this email exists, a new verification link has been sent.',
    }
  }
}
