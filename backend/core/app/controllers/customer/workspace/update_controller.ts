import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import { WorkspaceNameS } from '#validators/workspace'

export const validator = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),

    name: WorkspaceNameS().optional(),
  })
)

export default class UpdateController {
  async handle(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(validator)

    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await ctx.bouncer.with('WorkspacePolicy').authorize('update', workspace)

    if (payload.name) {
      workspace.name = payload.name
    }

    await workspace.save()

    return {
      workspace: await workspace.transformer.serialize(),
    }
  }
}
