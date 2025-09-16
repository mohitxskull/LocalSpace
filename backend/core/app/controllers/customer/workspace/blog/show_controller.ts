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

export default class ShowController {
  async handle({ bouncer, request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const blog = await Blog.findOrFail(params.blogId)

    await bouncer.with('BlogPolicy').authorize('view', blog)

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
