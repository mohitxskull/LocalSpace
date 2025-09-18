import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { BadRequestException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import { dbRef } from '#database/reference'
import { DateTime } from 'luxon'
import { workspaceMemberRoleE } from '#types/literals'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('view', workspace)

    const member = await workspace.helper.activeMemberQuery
      .where(dbRef.workspaceMember.userId, user.id)
      .firstOrFail()

    if (member.role === workspaceMemberRoleE('owner')) {
      throw new BadRequestException(
        'As the workspace owner, you cannot leave. Please transfer ownership to another member first.'
      )
    }

    member.leftAt = DateTime.now()

    await member.save()

    await Workspace.cacher.getActiveMembers({ workspace }).expire()

    return { message: 'You have successfully left the workspace.' }
  }
}
