import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerNameS, CustomerPasswordS } from '#validators/customer'
import { setting } from '#config/setting'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email_notification'
import { AccessTokenManager } from '#miscellaneous/access_token_manager'
import { accessTokenTypeE, credentialTypeE } from '#types/literals'

export const input = vine.compile(
  vine.object({
    name: CustomerNameS(),
    email: CustomerEMailS(),
    password: CustomerPasswordS(),
    confirmPassword: CustomerPasswordS().sameAs('password'),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    if (!setting.customer.signUp.active) {
      throw new ForbiddenException(ctx.i18n.t('customer.auth.sign_up.disabled'))
    }

    const payload = await ctx.request.validateUsing(input)

    const credentialExist = await Credential.findBy({
      [dbRef.credential.identifierC]: payload.email,
      [dbRef.credential.typeC]: credentialTypeE('email'),
    })

    if (credentialExist) {
      throw new BadRequestException(ctx.i18n.t('customer.auth.sign_up.email_exists'), {
        source: 'email',
        reason: 'Email not found',
      })
    }

    const trx = await db.transaction()

    try {
      const user = await User.create(
        {
          name: payload.name,
        },
        {
          client: trx,
        }
      )

      const credential = await user.related('credentials').create({
        type: 'email',
        identifier: payload.email,
        password: payload.password,
      })

      await user.related('customerProfile').create({
        email: payload.email,
      })

      const verificationRequired = setting.credential.email.verification.enabled

      if (verificationRequired) {
        const accessTokenHolder = await AccessTokenManager.create({
          type: accessTokenTypeE('email_verification'),
          user,
          expiresIn: setting.credential.email.verification.expiresIn,
        })

        await mail.sendLater(new VerifyEmailNotification({ user, credential, accessTokenHolder }))
      }

      await trx.commit()

      return {
        user: await user.transformer.serialize(),
        message: ctx.i18n.t(
          verificationRequired
            ? 'customer.auth.sign_up.email_verification_required'
            : 'customer.auth.sign_up.success'
        ),
        meta: {
          email: {
            verificationRequired,
          },
        },
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
