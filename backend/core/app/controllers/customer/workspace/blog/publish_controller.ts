import type { HttpContext } from '@adonisjs/core/http'

export default class PublishController {
  async handle(ctx: HttpContext) {
    return 'Publish blog'
  }
}
