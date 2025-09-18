import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException, NotFoundException } from '@localspace/node-lib/exception'
import { workspaceMemberRoleE } from '#types/literals'
import WorkspaceMember from '#models/workspace_member'
import { ULIDS } from '#validators/index'
import { dbRef } from '#database/reference'
import { setting } from '#config/setting'

export const input = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),

    newOwnerId: ULIDS(),
  })
)

export default class Controller {
  async handle({ bouncer, request, auth, i18n }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(input)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('transfer', workspace)

    const newOwner = await WorkspaceMember.query()
      .where(dbRef.workspaceMember.workspaceId, workspace.id)
      .andWhere(dbRef.workspaceMember.userId, payload.newOwnerId)
      .first()

    if (!newOwner) {
      throw new NotFoundException(i18n.t('customer.workspace.transfer.new_owner_not_found'))
    }

    const ownedWorkspacesCount = await user
      .related('workspaceMember')
      .query()
      .andWhere(dbRef.workspaceMember.role, workspaceMemberRoleE('owner'))
      .count('*', 'total')
      .then((result) => result.pop()!.total)

    if (ownedWorkspacesCount >= setting.customer.workspace.max) {
      throw new ForbiddenException(i18n.t('customer.workspace.transfer.new_owner_max_workspaces'))
    }

    const trx = await db.transaction()

    try {
      const oldOwner = await WorkspaceMember.query({ client: trx })
        .where(dbRef.workspaceMember.workspaceId, workspace.id)
        .andWhere(dbRef.workspaceMember.userId, user.id)
        .firstOrFail()

      oldOwner.role = workspaceMemberRoleE('manager')
      await oldOwner.save()

      newOwner.useTransaction(trx)
      newOwner.role = workspaceMemberRoleE('owner')

      await newOwner.save()

      await trx.commit()

      await Workspace.cacher.activeMembers({ workspace }).expire()

      return {
        message: i18n.t('customer.workspace.transfer.success'),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
