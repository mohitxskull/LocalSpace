import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerPasswordS } from '#validators/customer'
import { setting } from '#config/setting'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Token from '#models/token'
import { tokenTypeE, credentialTypeE } from '#types/literals'
import limiter from '@adonisjs/limiter/services/main'
import CredentialVerification from '#models/credential_verification'
import tokenService from '#services/token_service'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
    password: CustomerPasswordS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    if (!setting.customer.signIn.active) {
      throw new ForbiddenException(ctx.i18n.t('customer.auth.sign_in.disabled'))
    }

    const payload = await ctx.request.validateUsing(input)

    const signInLimiter = limiter.use({
      requests: 5,
      duration: '1 day',
    })

    await signInLimiter.consume(`customer_sign_in_${ctx.request.ip()}_${payload.email}`)

    const trx = await db.transaction()

    try {
      const credential = await Credential.findBy(
        {
          [dbRef.credential.identifierC]: payload.email,
          [dbRef.credential.typeC]: credentialTypeE('email'),
        },
        {
          client: trx,
        }
      )

      if (!credential) {
        await hash.make(payload.password)

        throw new BadRequestException(ctx.i18n.t('customer.auth.sign_in.invalid_credentials'), {
          source: 'email',
          reason: 'Email not found',
        })
      }

      const credentialPassword = credential.getPasswordOrFail()

      if (!(await hash.verify(credentialPassword, payload.password))) {
        throw new BadRequestException(ctx.i18n.t('customer.auth.sign_in.invalid_credentials'), {
          source: 'email',
          reason: 'Password is incorrect',
        })
      }

      await credential.load('user')

      const user = credential.user

      const emailVerificationRequired = setting.credential.email.verification.enabled

      if (emailVerificationRequired) {
        const credentialVerification = await CredentialVerification.find(credential.id, {
          client: trx,
        })

        if (!credentialVerification || !credentialVerification.verifiedAt) {
          throw new BadRequestException(
            ctx.i18n.t('customer.auth.sign_in.email_verification_required'),
            {
              code: 'EMAIL_NOT_VERIFIED',
              source: 'email',
              reason: 'Email verification is required',
            }
          )
        }
      }

      credential.usedAt = DateTime.now()

      await credential.save()

      const existingAccessTokens = await Token.query({ client: trx }).where({
        [dbRef.token.tokenableId]: user.id,
        [dbRef.token.type]: tokenTypeE('access'),
      })

      const maxTokensAfterNewOne = setting.session.max
      const currentTokenCount = existingAccessTokens.length
      const tokensToDeleteCount = Math.max(0, currentTokenCount - maxTokensAfterNewOne + 1)

      if (tokensToDeleteCount > 0) {
        const tokensToDelete = existingAccessTokens
          .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
          .slice(0, tokensToDeleteCount)

        await Token.query({ client: trx })
          .whereIn(
            dbRef.token.id,
            tokensToDelete.map((token) => token.id)
          )
          .delete()
      }

      const token = await tokenService.create(
        {
          user,
          type: tokenTypeE('access'),
          expiresIn: setting.session.expiresIn,
        },
        {
          client: trx,
        }
      )

      await trx.commit()

      return {
        token: token.serialize(),
        message: ctx.i18n.t('customer.auth.sign_in.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
