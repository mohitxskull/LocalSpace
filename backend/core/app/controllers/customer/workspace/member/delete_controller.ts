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
        ctx.i18n.t('customer.workspace.member.delete.cannot_remove_self')
      )
    }

    const memberToRemove = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.id, payload.params.memberId)
      .andWhereNotNull(dbRef.workspaceMember.joinedAt)
      .andWhereNull(dbRef.workspaceMember.leftAt)
      .firstOrFail()

    memberToRemove.leftAt = DateTime.now()

    await memberToRemove.save()

    await Workspace.cacher.activeMembers({ workspace }).expire()

    return { message: ctx.i18n.t('customer.workspace.member.delete.success') }
  }
}
