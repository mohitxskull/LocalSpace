import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException, NotFoundException } from '@localspace/node-lib/exception'
import { workspaceMemberRoleE } from '#types/literals'
import WorkspaceMember from '#models/workspace_member'

const input = vine.compile(
  vine.object({
    newOwnerId: vine.string(),
  })
)

export default class TransferController {
  async handle({ bouncer, params, request, auth, i18n }: HttpContext) {
    const user = auth.getUserOrFail()
    const workspace = await Workspace.findOrFail(params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('transfer', workspace)

    const { newOwnerId } = await request.validateUsing(input)

    const newOwner = await WorkspaceMember.query()
      .where('workspace_id', workspace.id)
      .andWhere('user_id', newOwnerId)
      .first()

    if (!newOwner) {
      throw new NotFoundException(i18n.t('customer.workspace.transfer.new_owner_not_found'))
    }

    const ownedWorkspacesCount = await db
      .from('workspace_members')
      .where('user_id', newOwnerId)
      .andWhere('role', workspaceMemberRoleE('owner'))
      .count('*', 'total')

    if (Number(ownedWorkspacesCount[0].total) >= 5) {
      throw new ForbiddenException(i18n.t('customer.workspace.transfer.new_owner_max_workspaces'))
    }

    const trx = await db.transaction()

    try {
      const oldOwner = await WorkspaceMember.query({ client: trx })
        .where('workspace_id', workspace.id)
        .andWhere('user_id', user.id)
        .firstOrFail()

      oldOwner.role = workspaceMemberRoleE('member')
      await oldOwner.save()

      newOwner.useTransaction(trx)
      newOwner.role = workspaceMemberRoleE('owner')
      await newOwner.save()

      await trx.commit()

      return {
        message: i18n.t('customer.workspace.transfer.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
