import { tokenTypeE } from '#types/literals'
import { CustomerPasswordS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import tokenService from '#services/token_service'
import vine from '@vinejs/vine'
import { ForbiddenException } from '@localspace/node-lib/exception'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

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
      const accessTokenHolder = await tokenService.verify(
        {
          token: payload.token,
          type: tokenTypeE('password_reset'),
        },
        {
          client: trx,
        }
      )

      if (!accessTokenHolder) {
        throw new ForbiddenException('The provided token is invalid or has expired.')
      }

      const user = await User.find(accessTokenHolder.tokenableId, {
        client: trx,
      })

      if (!user) {
        throw new ForbiddenException('The provided token is invalid or has expired.')
      }

      user.password = payload.newPassword

      await user.save()

      await accessTokenHolder.delete({ client: trx })

      await trx.commit()

      return {
        message: 'Your password has been successfully reset.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
