import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import Permission from '#models/permission'
import User from '#models/user'
import riManager from '#services/ri_service'
import Blog from '#models/blog'
import { dbRef } from '#database/reference'

const input = vine.compile(
  vine.object({
    actions: vine.array(vine.string()),
  })
)

export default class UpdateForBlogController {
  async handle({ bouncer, params, request, i18n }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const blog = await Blog.findOrFail(params.blogId)
    const member = await User.findOrFail(params.memberId)
    const { actions } = await request.validateUsing(input)

    const ri = riManager.build().workspace(workspace.id).blog(blog.id).toString()

    const trx = await db.transaction()

    try {
      await Permission.query({ client: trx })
        .where(dbRef.permissions.userId, member.id)
        .andWhere(dbRef.permissions.riPattern, ri)
        .delete()

      if (actions.length > 0) {
        await Permission.create(
          {
            userId: member.id,
            riPattern: ri,
            actions: actions,
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
