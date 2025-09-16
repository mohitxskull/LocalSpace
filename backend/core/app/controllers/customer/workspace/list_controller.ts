import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'

export default class ListController {
  async handle({ auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const workspaces = await Workspace.query()
      .whereHas('members', (query) => {
        query.where('user_id', user.id)
      })
      .preload('members')

    return {
      workspaces: await Promise.all(workspaces.map((w) => w.transformer.serialize())),
    }
  }
}
