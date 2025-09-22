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

    const payload = await ctx.request.validateUsing(input)

    if (!(await hash.verify(user.password, payload.oldPassword))) {
      throw new BadRequestException('The old password you entered is incorrect.', {
        source: 'oldPassword',
      })
    }

    user.password = payload.newPassword

    await user.save()

    return {
      user: await user.transformer.serialize(),
      message: 'Your password has been updated successfully.',
    }
  }
}
