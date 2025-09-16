import type { HttpContext } from '@adonisjs/core/http'

export default class UnpublishController {
  async handle(ctx: HttpContext) {
    return 'Unpublish blog'
  }
}
