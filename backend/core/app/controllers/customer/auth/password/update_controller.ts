import { dbRef } from '#database/reference'
import Credential from '#models/credential'
import { credentialTypeE } from '#types/literals'
import { CustomerPasswordS } from '#validators/customer'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import { BadRequestException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'

export const input = vine.compile(
  vine.object({
    oldPassword: CustomerPasswordS(),
    newPassword: CustomerPasswordS().notSameAs('oldPassword'),
    confirmNewPassword: CustomerPasswordS().sameAs('newPassword'),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const credential = await Credential.findByOrFail({
      [dbRef.credential.userIdC]: user.id,
      [dbRef.credential.typeC]: credentialTypeE('email'),
    })

    const payload = await ctx.request.validateUsing(input)

    const credentialPassword = credential.getPasswordOrFail()

    if (!(await hash.verify(credentialPassword, payload.oldPassword))) {
      throw new BadRequestException(ctx.i18n.t('customer.auth.password.update.invalid_password'), {
        source: 'oldPassword',
      })
    }

    credential.password = payload.newPassword

    await credential.save()

    return {
      user: await user.transformer.serialize(),
      message: ctx.i18n.t('customer.auth.password.update.success'),
    }
  }
}
