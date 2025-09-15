import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { accessTokenTypeE } from '#types/literals'
import { CustomerPasswordS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import { accessTokenService } from '#services/access_token_service'
import vine from '@vinejs/vine'
import { ForbiddenException } from '@localspace/node-lib/exception'
import db from '@adonisjs/lucid/services/db'

export const input = vine.compile(
  vine.object({
    token: vine.string().minLength(10).maxLength(500).trim(),
    newPassword: CustomerPasswordS(),
    confirmNewPassword: CustomerPasswordS().sameAs('newPassword'),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(input)
    const trx = await db.transaction()

    try {
      const accessTokenHolder = await accessTokenService.verify(
        {
          token: payload.token,
          type: accessTokenTypeE('password_reset'),
        },
        {
          client: trx,
        }
      )

      if (!accessTokenHolder) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.password.reset.invalid_token'))
      }

      const credential = await Credential.findBy(
        {
          [dbRef.credential.userIdC]: accessTokenHolder.tokenableId,
        },
        {
          client: trx,
        }
      )

      if (!credential) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.password.reset.invalid_token'))
      }

      credential.password = payload.newPassword
      await credential.save()

      await accessTokenHolder.delete({ client: trx })

      await trx.commit()

      return {
        message: ctx.i18n.t('customer.auth.password.reset.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}