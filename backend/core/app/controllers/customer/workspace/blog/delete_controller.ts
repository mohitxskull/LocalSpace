import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import Workspace from '#models/workspace'
import { dbRef } from '#database/reference'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
      blogId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    const blog = await workspace
      .related('blogs')
      .query()
      .where(dbRef.blog.id, payload.params.blogId)
      .firstOrFail()

    await ctx.bouncer.with('BlogPolicy').authorize('delete', workspace, blog)

    await blog.delete()

    return { message: 'Blog deleted successfully.' }
  }
}
