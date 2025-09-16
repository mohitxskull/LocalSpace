import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'

export const input = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle({ bouncer, request, i18n }: HttpContext) {
    const payload = await request.validateUsing(input)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('delete', workspace)

    await workspace.delete()

    return {
      message: i18n.t('customer.workspace.delete.success'),
    }
  }
}
