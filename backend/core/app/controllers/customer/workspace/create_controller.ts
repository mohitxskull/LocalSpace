import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException } from '@localspace/node-lib/exception'
import { WorkspaceNameS } from '#validators/workspace'
import { DateTime } from 'luxon'
import { getSetting } from '#util/get_setting'

export const input = vine.compile(
  vine.object({
    name: WorkspaceNameS(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const setting = getSetting()
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(input)

    const ownedWorkspacesCount = await user.helper.getOwnedWorkspaceCount()

    if (ownedWorkspacesCount >= setting.customer.workspace.max) {
      throw new ForbiddenException('You have reached the maximum number of workspaces you can own.')
    }

    const trx = await db.transaction()

    try {
      const workspace = await Workspace.create(
        {
          name: payload.name,
        },
        {
          client: trx,
        }
      )

      await workspace.related('members').create({
        userId: user.id,
        role: workspaceMemberRoleE('owner'),
        joinedAt: DateTime.now(),
      })

      await trx.commit()

      return {
        workspace: await workspace.transformer.serialize(),
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
