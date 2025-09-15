import vine from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { setting } from '#config/setting'
import { ForbiddenException } from '@localspace/node-lib/exception'
import { accessTokenService } from '#services/access_token_service'
import Credential from '#models/credential'
import { dbRef } from '#database/reference'
import { credentialTypeE } from '#types/literals'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

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
      const accessTokenHolder = await accessTokenService.verify(
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

      const credential = await Credential.findBy(
        {
          [dbRef.credential.userIdC]: accessTokenHolder.tokenableId,
          [dbRef.credential.typeC]: credentialTypeE('email'),
        },
        {
          client: trx,
        }
      )

      if (!credential) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.invalid'))
      }

      if (credential.verifiedAt) {
        throw new ForbiddenException(ctx.i18n.t('customer.auth.verify.already_verified'))
      }

      credential.verifiedAt = DateTime.now()

      await Promise.all([credential.save(), accessTokenHolder.delete({ client: trx })])

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