import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { credentialTypeE, tokenTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import tokenService from '#services/token_service'
import { setting } from '#config/setting'
import mail from '@adonisjs/mail/services/main'
import PasswordResetNotification from '#mails/password_reset_notification'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(input)

    const credential = await Credential.query()
      .where(dbRef.credential.identifierC, payload.email)
      .andWhere(dbRef.credential.typeC, credentialTypeE('email'))
      .preload('user')
      .first()

    if (credential) {
      const accessTokenHolder = await tokenService.create(
        {
          type: tokenTypeE('password_reset'),
          user: credential.user,
          expiresIn: setting.credential.email.passwordReset.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await mail.sendLater(
        new PasswordResetNotification({
          user: credential.user,
          credential,
          accessTokenHolder,
        })
      )
    }

    return {
      message: ctx.i18n.t('customer.auth.password.forgot.success'),
    }
  }
}
