import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const test = User.cacher.goat()

    return {
      user: await user.transformer.serialize(),
    }
  }
}
