import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Blog from '#models/blog'
import { ULIDS } from '#validators/index'

export const validator = vine.compile(
  vine.object({
    title: vine.string().minLength(5).maxLength(100),
    content: vine.string().minLength(10),
    params: vine.object({
      workspaceId: ULIDS(),
      blogId: ULIDS(),
    }),
  })
)

export default class UpdateController {
  async handle({ bouncer, request }: HttpContext) {
    const payload = await request.validateUsing(validator)
    const blog = await Blog.findOrFail(payload.params.blogId)
    await bouncer.with('BlogPolicy').authorize('update', blog)

    blog.merge(payload)
    await blog.save()

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
