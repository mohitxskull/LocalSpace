import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
      blogId: ULIDS(),
    }),
  })
)

export default class DeleteController {
  async handle({ bouncer, request, i18n }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const blog = await Blog.findOrFail(params.blogId)
    await bouncer.with('BlogPolicy').authorize('delete', blog)

    await blog.delete()

    return { message: i18n.t('customer.workspace.blog.delete.success') }
  }
}
