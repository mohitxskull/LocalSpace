import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerPasswordS } from '#validators/customer'
import User from '#models/user'
import { dbRef } from '#database/reference'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import Token from '#models/token'
import { tokenTypeE } from '#types/literals'
import limiter from '@adonisjs/limiter/services/main'
import tokenService from '#services/token_service'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    email: CustomerEMailS(),
    password: CustomerPasswordS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const setting = getSetting()
    if (!setting.customer.signIn.active) {
      throw new ForbiddenException('signin is currently disabled.')
    }

    const payload = await ctx.request.validateUsing(input)

    const signInLimiter = limiter.use({
      requests: 5,
      duration: '1 day',
    })

    await signInLimiter.consume(`customer_sign_in_${ctx.request.ip()}_${payload.email}`)

    const trx = await db.transaction()

    try {
      const user = await User.query({ client: trx }).where(dbRef.user.email, payload.email).first()

      if (!user) {
        await hash.make(payload.password)

        throw new BadRequestException('Invalid email or password.', {
          source: 'email',
          reason: 'Email not found',
        })
      }

      if (!user.password) {
        throw new BadRequestException('Invalid email or password.', {
          source: 'email',
          reason: 'Password not set',
        })
      }

      if (!(await hash.verify(user.password, payload.password))) {
        throw new BadRequestException('Invalid email or password.', {
          source: 'email',
          reason: 'Password is incorrect',
        })
      }

      const emailVerificationRequired = setting.credential.email.verification.enabled

      if (emailVerificationRequired && !user.verifiedAt) {
        throw new BadRequestException(
          'Your email address is not verified. Please check your inbox for a verification link.',
          {
            code: 'EMAIL_NOT_VERIFIED',
            source: 'email',
            reason: 'Email verification is required',
          }
        )
      }

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
        message: 'You have been signed in successfully.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
