import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import Permission from '#models/permission'
import User from '#models/user'
import riManager from '#services/ri_service'
import Blog from '#models/blog'
import { dbRef } from '#database/reference'
import { ULIDS } from '#validators/index'

export const validator = vine.compile(
  vine.object({
    actions: vine.array(vine.string()),
    params: vine.object({
      workspaceId: ULIDS(),
      blogId: ULIDS(),
      memberId: ULIDS(),
    }),
  })
)

export default class UpdateController {
  async handle({ bouncer, request, i18n }: HttpContext) {
    const payload = await request.validateUsing(validator)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const blog = await Blog.findOrFail(payload.params.blogId)
    const member = await User.findOrFail(payload.params.memberId)

    const ri = riManager.build().workspace(workspace.id).blog(blog.id).toString()

    const trx = await db.transaction()

    try {
      await Permission.query({ client: trx })
        .where(dbRef.permission.userId, member.id)
        .andWhere(dbRef.permission.riPattern, ri)
        .delete()

      if (payload.actions.length > 0) {
        await Permission.create(
          {
            userId: member.id,
            riPattern: ri,
            actions: payload.actions,
          },
          { client: trx }
        )
      }

      await trx.commit()

      return { message: i18n.t('customer.workspace.permission.update.success') }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
