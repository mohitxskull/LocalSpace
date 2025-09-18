import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException } from '@localspace/node-lib/exception'
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
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const payload = await ctx.request.validateUsing(input)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('transfer', workspace)

    const newOwner = await workspace
      .related('members')
      .query()
      .andWhere(dbRef.workspaceMember.userId, payload.newOwnerId)
      .preload('user')
      .firstOrFail()

    const ownedWorkspacesCount = await newOwner.user
      .related('workspaceMember')
      .query()
      .andWhere(dbRef.workspaceMember.role, workspaceMemberRoleE('owner'))
      .count('*', 'total')
      .then((result) => result.pop()?.total || 0)

    if (ownedWorkspacesCount >= setting.customer.workspace.max) {
      throw new ForbiddenException(
        `The new owner has reached the maximum number of workspaces allowed.`
      )
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
        message: `Workspace successfully transferred to ${newOwner.user.name}.`,
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
