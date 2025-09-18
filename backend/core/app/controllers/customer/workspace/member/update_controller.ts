import { WorkspaceMemberUpdatableRoleS } from '#validators/workspace_member'
import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { workspaceMemberRoleE } from '#types/literals'
import { ULIDS } from '#validators/index'
import { BadRequestException } from '@localspace/node-lib/exception'
import { dbRef } from '#database/reference'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
      memberId: ULIDS(),
    }),

    role: WorkspaceMemberUpdatableRoleS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    if (user.id === payload.params.memberId) {
      throw new BadRequestException('You cannot change your own role within the workspace.')
    }

    const memberToUpdate = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, payload.params.memberId)
      .andWhereNotNull(dbRef.workspaceMember.joinedAt)
      .andWhereNull(dbRef.workspaceMember.leftAt)
      .firstOrFail()

    if (memberToUpdate.role === workspaceMemberRoleE('owner')) {
      throw new BadRequestException(
        "The owner's role cannot be changed. To change ownership, please transfer the workspace to another member."
      )
    }

    memberToUpdate.role = payload.role

    await memberToUpdate.save()

    await Workspace.cacher.getActiveMembers({ workspace }).expire()

    return { message: "The member's role has been updated successfully." }
  }
}
