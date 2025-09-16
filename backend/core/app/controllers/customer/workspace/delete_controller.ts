import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'

export default class DeleteController {
  async handle({ bouncer, params, i18n }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('delete', workspace)

    await workspace.delete()

    return {
      message: i18n.t('customer.workspace.delete.success'),
    }
  }
}
