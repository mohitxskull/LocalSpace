import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'

export default class ShowController {
  async handle({ bouncer, params }: HttpContext) {
    const blog = await Blog.findOrFail(params.blogId)

    await bouncer.with('BlogPolicy').authorize('view', blog)

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
