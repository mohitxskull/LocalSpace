import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException } from '@localspace/node-lib/exception'
import { workspaceMemberRoleE } from '#types/literals'
import { ULIDS } from '#validators/index'
import { dbRef } from '#database/reference'
import { getSetting } from '#util/get_setting'

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
    const setting = getSetting()
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(input)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('transfer', workspace)

    const newOwner = await workspace.helper.activeMemberQuery
      .andWhere(dbRef.workspaceMember.userId, payload.newOwnerId)
      .preload('user')
      .firstOrFail()

    const ownedWorkspacesCount = await newOwner.user.helper.getOwnedWorkspaceCount()

    if (ownedWorkspacesCount >= setting.customer.workspace.max) {
      throw new ForbiddenException(
        `The new owner has reached the maximum number of workspaces allowed.`
      )
    }

    const trx = await db.transaction()

    try {
      workspace.useTransaction(trx)

      const oldOwner = await workspace
        .related('members')
        .query()
        .where(dbRef.workspaceMember.userId, user.id)
        .firstOrFail()

      oldOwner.role = workspaceMemberRoleE('manager')

      await oldOwner.save()

      newOwner.useTransaction(trx)

      newOwner.role = workspaceMemberRoleE('owner')

      await newOwner.save()

      await trx.commit()

      await Workspace.cacher.getActiveMembers({ workspace }).expire()

      return {
        message: `Workspace successfully transferred to ${newOwner.user.name}.`,
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
