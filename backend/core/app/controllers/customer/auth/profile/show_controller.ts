import type { HttpContext } from '@adonisjs/core/http'

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    return {
      user: await user.transformer.serialize(),
    }
  }
}
