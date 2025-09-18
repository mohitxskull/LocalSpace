import { dbRef } from '#database/reference'
import { DirectionS, FilterValueS, LimitS, PageS } from '#validators/index'
import type { HttpContext } from '@adonisjs/core/http'
import { iLike, serializePage } from '@localspace/node-lib'
import vine from '@vinejs/vine'
import Workspace from '#models/workspace'
import { directionE } from '#types/literals'

export const input = vine.compile(
  vine
    .object({
      query: vine
        .object({
          page: PageS().optional(),
          limit: LimitS().optional(),
          order: vine
            .object({
              field: vine
                .enum([dbRef.workspace.name, dbRef.workspace.createdAt, dbRef.workspace.updatedAt])
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
    .optional()
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(input)

    const page = payload?.query?.page || 1
    const limit = payload?.query?.limit || 10
    const orderBy = payload?.query?.order?.field || dbRef.workspace.createdAt
    const orderDir = payload?.query?.order?.dir || directionE('desc')

    const listQuery = Workspace.query().whereHas('members', (query) => {
      query.where(dbRef.workspaceMember.userId, user.id)
    })

    const filterValue = payload?.query?.filter?.value

    if (filterValue) {
      listQuery.whereRaw(...iLike(dbRef.workspace.name, filterValue))
    }

    listQuery.orderBy(orderBy, orderDir)

    const workspaces = await listQuery.paginate(page, limit)

    return await serializePage(
      workspaces,
      async (workspace) => await workspace.transformer.serialize()
    )
  }
}
