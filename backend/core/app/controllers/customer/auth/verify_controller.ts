import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { setting } from '#config/setting'
import { ForbiddenException } from '@localspace/node-lib/exception'
import tokenService from '#services/token_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export const input = vine.compile(
  vine.object({
    token: vine.string().minLength(10).maxLength(500).trim(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    if (!setting.credential.email.verification.enabled) {
      throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.disabled'))
    }

    const trx = await db.transaction()

    const payload = await ctx.request.validateUsing(input)

    try {
      const accessTokenHolder = await tokenService.verify(
        {
          token: payload.token,
          type: 'email_verification',
        },
        {
          client: trx,
        }
      )

      if (!accessTokenHolder) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.invalid'))
      }

      const user = await User.find(accessTokenHolder.tokenableId, {
        client: trx,
      })

      if (!user) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.invalid'))
      }

      if (user.verifiedAt) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.already_verified'))
      }

      user.verifiedAt = DateTime.now()
      await user.save()

      await accessTokenHolder.delete({ client: trx })

      await trx.commit()

      return {
        message: ctx.i18n.t('customer.auth.verify.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
