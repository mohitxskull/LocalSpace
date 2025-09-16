import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'

export default class ShowController {
  async handle({ bouncer, params }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('view', workspace)

    await workspace.load('members')

    return {
      workspace: await workspace.transformer.serialize(),
    }
  }
}
