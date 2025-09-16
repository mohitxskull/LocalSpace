import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'

export const validator = vine.compile(
  vine.object({
    title: vine.string().minLength(5).maxLength(100),
    content: vine.string().minLength(10),
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class CreateController {
  async handle({ bouncer, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(validator)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)
    await bouncer.with('BlogPolicy').authorize('create', workspace)

    const blog = await workspace.related('blogs').create({
      title: payload.title,
      content: payload.content,
      authorId: user.id,
    })

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
