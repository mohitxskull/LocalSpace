import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { accessTokenTypeE, credentialTypeE } from '#types/literals'
import { CustomerEMailS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import { accessTokenService } from '#services/access_token_service'
import { setting } from '#config/setting'
import VerifyEmailNotification from '#mails/verify_email_notification'
import vine from '@vinejs/vine'
import { BadRequestException } from '@localspace/node-lib/exception'

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
      if (credential.verifiedAt) {
        throw new BadRequestException(ctx.i18n.t('customer.auth.verify.already_verified'))
      }

      const accessTokenHolder = await accessTokenService.create(
        {
          type: accessTokenTypeE('email_verification'),
          user: credential.user,
          expiresIn: setting.credential.email.verification.expiresIn,
        },
        {
          deleteIfExists: true,
        }
      )

      await emailService.send(
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