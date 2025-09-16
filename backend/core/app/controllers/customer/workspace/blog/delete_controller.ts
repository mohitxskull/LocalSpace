import type { HttpContext } from '@adonisjs/core/http'

export default class DeleteController {
  async handle(ctx: HttpContext) {
    return 'Delete blog'
  }
}
