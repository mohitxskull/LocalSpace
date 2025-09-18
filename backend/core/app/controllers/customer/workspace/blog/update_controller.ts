import { BlogContentS, BlogTitleS } from '#validators/blog'
import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import Blog from '#models/blog'
import { ULIDS } from '#validators/index'
import Workspace from '#models/workspace'

export const validator = vine.compile(
  vine.object({
    title: BlogTitleS(),
    content: BlogContentS(),
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
    await ctx.bouncer.with('BlogPolicy').authorize('update', workspace, blog)

    blog.merge(payload)
    await blog.save()

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
