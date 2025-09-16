import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'

const input = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
  })
)

export default class UpdateController {
  async handle({ bouncer, params, request }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('update', workspace)

    const { name } = await request.validateUsing(input)

    workspace.name = name
    await workspace.save()

    return {
      workspace: await workspace.transformer.serialize(),
    }
  }
}
