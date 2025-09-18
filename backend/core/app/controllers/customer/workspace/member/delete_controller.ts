import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { BadRequestException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import { dbRef } from '#database/reference'
import { DateTime } from 'luxon'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
      memberId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    if (user.id === payload.params.memberId) {
      throw new BadRequestException(
        'You cannot remove yourself from a workspace. Please use the "Leave Workspace" option instead.'
      )
    }

    const memberToRemove = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, payload.params.memberId)
      .andWhereNotNull(dbRef.workspaceMember.joinedAt)
      .andWhereNull(dbRef.workspaceMember.leftAt)
      .firstOrFail()

    memberToRemove.leftAt = DateTime.now()

    await memberToRemove.save()

    await Workspace.cacher.getActiveMembers({ workspace }).expire()

    return { message: 'The member has been removed from the workspace.' }
  }
}
