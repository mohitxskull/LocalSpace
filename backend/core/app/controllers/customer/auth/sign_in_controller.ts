import { BadRequestException, ForbiddenException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { CustomerEMailS, CustomerPasswordS } from '#validators/customer'
import { setting } from '#config/setting'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'
import hash from '@adonisjs/core/services/hash'
import { serializeAccessToken } from '@localspace/node-lib'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { AccessTokenManager } from '#miscellaneous/access_token_manager'
import AccessToken from '#models/access_token'
import { accessTokenTypeE, credentialTypeE } from '#types/literals'

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

      credential.usedAt = DateTime.now()

      await Promise.all([credential.save(), credential.load('user')])

      const user = credential.user

      const existingAuthAccessTokens = await AccessToken.query().where({
        [dbRef.accessToken.tokenableId]: user.id,
        [dbRef.accessToken.type]: accessTokenTypeE('auth'),
      })

      if (existingAuthAccessTokens.length > setting.session.max) {
        const tokensToDelete = existingAuthAccessTokens.slice(setting.session.max)
        await AccessToken.query()
          .whereIn(
            dbRef.accessToken.id,
            tokensToDelete.map((token) => token.id)
          )
          .delete()
      }

      const token = await AccessTokenManager.create({
        user,
        type: accessTokenTypeE('auth'),
        expiresIn: setting.session.expiresIn,
      })

      return {
        token: serializeAccessToken(token),
        message: ctx.i18n.t('customer.auth.sign_in.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
