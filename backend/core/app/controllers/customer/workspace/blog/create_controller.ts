import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'

export const input = vine.compile(
  vine.object({
    title: vine.string().minLength(5).maxLength(100),
    content: vine.string().minLength(10),
  })
)

export default class CreateController {
  async handle({ bouncer, params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('BlogPolicy').authorize('create', workspace)

    const { title, content } = await request.validateUsing(input)

    const blog = await workspace.related('blogs').create({
      title,
      content,
      authorId: user.id,
    })

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
