import type { HttpContext } from '@adonisjs/core/http'

export default class UpdateController {
  async handle(ctx: HttpContext) {
    return 'Update blog'
  }
}
