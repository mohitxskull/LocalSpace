import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import Permission from '#models/permission'
import User from '#models/user'
import { ULIDS } from '#validators/index'

export const input = vine.compile(
  vine.object({
    grants: vine.array(
      vine.object({
        ri: vine.string(),
        actions: vine.array(vine.string()),
      })
    ),
    params: vine.object({
      workspaceId: ULIDS(),
      memberId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle({ bouncer, request, i18n }: HttpContext) {
    const payload = await request.validateUsing(input)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const member = await User.findOrFail(payload.params.memberId)

    const trx = await db.transaction()

    try {
      await Permission.query({ client: trx }).where('user_id', member.id).delete()

      for (const grant of payload.grants) {
        if (grant.actions.length > 0) {
          await Permission.create(
            {
              userId: member.id,
              riPattern: grant.ri,
              actions: grant.actions,
            },
            { client: trx }
          )
        }
      }

      await trx.commit()

      return { message: i18n.t('customer.workspace.permission.update.success') }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
