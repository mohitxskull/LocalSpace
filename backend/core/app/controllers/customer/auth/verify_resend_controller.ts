import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { credentialTypeE, tokenTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import tokenService from '#services/token_service'
import { setting } from '#config/setting'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'

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
      .andWhereHas('verification', (q) => {
        q.whereNotNull(dbRef.credentialVerification.verifiedAt)
      })
      .preload('user')
      .first()

    if (credential) {
      const accessTokenHolder = await tokenService.create(
        {
          type: tokenTypeE('email_verification'),
          user: credential.user,
          expiresIn: setting.credential.email.verification.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await mail.sendLater(
        new VerifyEmailNotification({
          user: credential.user,
          credential,
          accessTokenHolder,
        })
      )
    }

    return {
      message: ctx.i18n.t('customer.auth.verify.resend_success'),
    }
  }
}
