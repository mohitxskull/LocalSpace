import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'

export default class ListController {
  async handle({ bouncer, params }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('view', workspace)

    const blogs = await workspace.related('blogs').query()

    return {
      blogs: await Promise.all(blogs.map((b) => b.transformer.serialize())),
    }
  }
}
