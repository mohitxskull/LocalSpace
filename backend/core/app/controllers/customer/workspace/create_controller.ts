import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { ForbiddenException } from '@localspace/node-lib/exception'
import { setting } from '#config/setting'
import { dbRef } from '#database/reference'

export const input = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50),
  })
)

export default class CreateController {
  async handle({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()

    const { name } = await request.validateUsing(input)

    const ownedWorkspacesCount = await user
      .related('workspaceMember')
      .query()
      .andWhere(dbRef.workspaceMember.role, workspaceMemberRoleE('owner'))
      .count('*', 'total')

    if (ownedWorkspacesCount[0].total >= setting.customer.workspace.max) {
      throw new ForbiddenException('You have reached the maximum number of workspaces you can own.')
    }

    const trx = await db.transaction()

    try {
      const workspace = await Workspace.create(
        {
          name,
        },
        {
          client: trx,
        }
      )

      await workspace.related('members').create({
        userId: user.id,
        role: workspaceMemberRoleE('owner'),
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
