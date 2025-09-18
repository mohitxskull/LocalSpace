import { WorkspaceMemberRoleS } from '#validators/workspace_member'
import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { NotFoundException, BadRequestException } from '@localspace/node-lib/exception'
import { workspaceMemberRoleE } from '#types/literals'
import User from '#models/user'
import { dbRef } from '#database/reference'
import { ULIDS } from '#validators/index'
import { DateTime } from 'luxon'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),

    email: vine.string().email(),
    role: WorkspaceMemberRoleS().optional(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(validator)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const userToAdd = await User.query()
      .where(dbRef.user.email, payload.email)
      .andWhereNotNull(dbRef.user.verifiedAt)
      .first()

    if (!userToAdd) {
      throw new NotFoundException(ctx.i18n.t('customer.workspace.member.store.user_not_found'))
    }

    const userToAddMember = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, userToAdd.id)
      .first()

    if (userToAddMember) {
      if (userToAddMember.joinedAt && !userToAddMember.leftAt) {
        throw new BadRequestException(ctx.i18n.t('customer.workspace.member.store.already_member'))
      }

      if (userToAddMember.leftAt) {
        userToAddMember.leftAt = null
        userToAddMember.joinedAt = DateTime.now()

        await userToAddMember.save()
      }
    } else {
      await workspace.related('members').create({
        userId: userToAdd.id,
        role: payload.role || workspaceMemberRoleE('viewer'),
      })
    }

    await Workspace.cacher.activeMembers({ workspace }).expire()

    return { message: ctx.i18n.t('customer.workspace.member.store.success') }
  }
}
