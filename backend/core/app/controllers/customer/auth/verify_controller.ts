import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { ForbiddenException } from '@localspace/node-lib/exception'
import tokenService from '#services/token_service'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    token: vine.string().minLength(10).maxLength(500).trim(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const setting = getSetting()
    if (!setting.credential.email.verification.enabled) {
      throw new ForbiddenException('Email verification is currently disabled.')
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
        throw new ForbiddenException('The verification link is invalid or has expired.')
      }

      const user = await User.find(accessTokenHolder.tokenableId, {
        client: trx,
      })

      if (!user) {
        throw new ForbiddenException('The verification link is invalid or has expired.')
      }

      if (user.verifiedAt) {
        throw new ForbiddenException('Your email address has already been verified.')
      }

      user.verifiedAt = DateTime.now()

      await user.save()

      await accessTokenHolder.delete({ client: trx })

      await trx.commit()

      return {
        message: 'Your email address has been verified successfully.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
