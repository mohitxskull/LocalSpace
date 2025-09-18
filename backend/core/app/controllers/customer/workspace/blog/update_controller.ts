import { BlogContentS, BlogTitleS } from '#validators/blog'
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
    title: BlogTitleS(),
    content: BlogContentS(),
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

    await ctx.bouncer.with('BlogPolicy').authorize('update', workspace, blog)

    if (payload.title) {
      blog.title = payload.title
    }

    if (payload.content) {
      blog.content = payload.content
    }

    await blog.save()

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
