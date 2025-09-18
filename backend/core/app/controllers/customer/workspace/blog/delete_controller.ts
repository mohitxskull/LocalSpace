import type { HttpContext } from '@adonisjs/core/http'
import Blog from '#models/blog'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import Workspace from '#models/workspace'

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
    const blog = await Blog.findOrFail(payload.params.blogId)
    await ctx.bouncer.with('BlogPolicy').authorize('delete', workspace, blog)

    await blog.delete()

    return { message: ctx.i18n.t('customer.workspace.blog.delete.success') }
  }
}
