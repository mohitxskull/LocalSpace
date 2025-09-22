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
    .optional()
)

export default class Controller {
  async handle(ctx: HttpContext) {
    const user = ctx.auth.getUserOrFail()

    const payload = await ctx.request.validateUsing(input)

    const page = payload?.page || 1
    const limit = payload?.limit || 10
    const orderBy = payload?.order?.field || dbRef.workspace.createdAt
    const orderDir = payload?.order?.dir || directionE('desc')

    const listQuery = Workspace.query()
      .whereHas('members', (memberQuery) => {
        memberQuery
          .where(dbRef.workspaceMember.userId, user.id)
          .andWhereNotNull(dbRef.workspaceMember.joinedAt)
          .andWhereNull(dbRef.workspaceMember.leftAt)
      })
      .preload('members', (memberQuery) => {
        memberQuery.where(dbRef.workspaceMember.userId, user.id).groupLimit(1)
      })

    const filterValue = payload?.filter?.value

    if (filterValue) {
      listQuery.whereRaw(...iLike(dbRef.workspace.name, filterValue))
    }

    listQuery.orderBy(orderBy, orderDir)

    const workspaces = await listQuery.paginate(page, limit)

    return await serializePage(workspaces, async (workspace) => {
      const workspaceMember = workspace.members.pop()

      if (!workspaceMember) {
        throw new Error('Workspace member not found', {
          cause: {
            workspaceId: workspace.id,
            userId: user.id,
          },
        })
      }

      const serializedMember = await workspaceMember.transformer.serialize()
      const serializedWorkspace = await workspace.transformer.serialize()

      return { ...serializedWorkspace, member: serializedMember }
    })
  }
}
