import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import Permission from '#models/permission'
import User from '#models/user'

const input = vine.compile(
  vine.object({
    grants: vine.array(
      vine.object({
        ri: vine.string(),
        actions: vine.array(vine.string()),
      })
    ),
  })
)

export default class UpdateController {
  async handle({ bouncer, params, request, i18n }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const member = await User.findOrFail(params.memberId)
    const { grants } = await request.validateUsing(input)

    const trx = await db.transaction()

    try {
      await Permission.query().useTransaction(trx).where('user_id', member.id).delete()

      for (const grant of grants) {
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
