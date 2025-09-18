import { dbRef } from '#database/reference'
import { DirectionS, FilterValueS, LimitS, PageS, ULIDS } from '#validators/index'
import type { HttpContext } from '@adonisjs/core/http'
import { iLike, serializePage } from '@localspace/node-lib'
import vine from '@vinejs/vine'
import Workspace from '#models/workspace'
import { directionE } from '#types/literals'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),
    query: vine
      .object({
        page: PageS().optional(),
        limit: LimitS().optional(),
        order: vine
          .object({
            field: vine
              .enum([dbRef.blog.title, dbRef.blog.createdAt, dbRef.blog.updatedAt])
              .optional(),
            dir: DirectionS().optional(),
          })
          .optional(),

        filter: vine
          .object({
            value: FilterValueS().optional(),
          })
          .optional(),
      })
      .optional(),
  })
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(validator)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('view', workspace)

    const page = payload.query?.page || 1
    const limit = payload.query?.limit || 10
    const orderBy = payload.query?.order?.field || dbRef.blog.createdAt
    const orderDir = payload.query?.order?.dir || directionE('desc')

    const listQuery = workspace.related('blogs').query()

    const filterValue = payload.query?.filter?.value

    if (filterValue) {
      listQuery.whereRaw(...iLike(dbRef.blog.title, filterValue))
    }

    listQuery.orderBy(orderBy, orderDir)

    const blogs = await listQuery.paginate(page, limit)

    return await serializePage(blogs, async (blog) => await blog.transformer.serialize())
  }
}
