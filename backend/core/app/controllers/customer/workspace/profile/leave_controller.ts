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

    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .andWhereNotNull(dbRef.workspaceMember.joinedAt)
      .andWhereNull(dbRef.workspaceMember.leftAt)
      .firstOrFail()

    if (member.role === workspaceMemberRoleE('owner')) {
      throw new BadRequestException(
        ctx.i18n.t('customer.workspace.profile.leave.cannot_leave_as_owner')
      )
    }

    member.leftAt = DateTime.now()

    await member.save()

    await Workspace.cacher.activeMembers({ workspace }).expire()

    return { message: ctx.i18n.t('customer.workspace.profile.leave.success') }
  }
}
