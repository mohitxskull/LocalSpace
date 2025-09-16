import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { BadRequestException } from '@localspace/node-lib/exception'

export default class DestroyController {
  async handle({ bouncer, params, auth, i18n }: HttpContext) {
    const user = auth.getUserOrFail()
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    if (user.id === params.memberId) {
      throw new BadRequestException(i18n.t('customer.workspace.member.destroy.cannot_remove_self'))
    }

    const memberToRemove = await workspace
      .related('members')
      .query()
      .where('user_id', params.memberId)
      .firstOrFail()

    await memberToRemove.delete()

    return { message: i18n.t('customer.workspace.member.destroy.success') }
  }
}
