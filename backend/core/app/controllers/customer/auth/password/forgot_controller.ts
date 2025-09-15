import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { accessTokenTypeE, credentialTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import { accessTokenService } from '#services/access_token_service'
import { setting } from '#config/setting'
import { emailService } from '#services/email_service'
import PasswordResetNotification from '#mails/password_reset_notification'
import vine from '@vinejs/vine'

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
      if (credential.status === 'bounced' || credential.status === 'complained') {
        // Silently fail to prevent account enumeration
        return {
          message: ctx.i18n.t('customer.auth.password.forgot.success'),
        }
      }

      const accessTokenHolder = await accessTokenService.create(
        {
          type: accessTokenTypeE('password_reset'),
          user: credential.user,
          expiresIn: setting.credential.email.passwordReset.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await emailService.send(
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