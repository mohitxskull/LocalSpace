import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import { blogStatusE } from '#types/literals'
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

export default class UnpublishController {
  async handle({ bouncer, request }: HttpContext) {
    const { params } = await request.validateUsing(validator)
    const blog = await Blog.findOrFail(params.blogId)
    await bouncer.with('BlogPolicy').authorize('publish', blog) // Using same policy

    blog.status = blogStatusE('draft')
    await blog.save()

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
