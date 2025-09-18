import { BlogContentS, BlogTitleS } from '#validators/blog'
import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import { setting } from '#config/setting'
import { ForbiddenException } from '@localspace/node-lib/exception'

export const validator = vine.compile(
  vine.object({
    title: BlogTitleS(),
    content: BlogContentS(),
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()
    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('BlogPolicy').authorize('create', workspace)

    const blogCount = await workspace.related('blogs').query().count('*', 'total').first()

    console.log('Blog Count: ', blogCount)

    if (blogCount && blogCount.total >= setting.customer.workspace.blog.max) {
      throw new ForbiddenException(
        'You have reached the maximum number of blogs for this workspace.'
      )
    }

    const member = await workspace.getMemberOrFail({ user })

    const blog = await workspace.related('blogs').create({
      title: payload.title,
      content: payload.content,
      authorId: member.id,
    })

    return {
      blog: await blog.transformer.serialize(),
    }
  }
}
