import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import vine from '@vinejs/vine'
import { ULIDS } from '#validators/index'
import { dbRef } from '#database/reference'

export const input = vine.compile(
  vine.object({
    params: vine.object({
      workspaceId: ULIDS(),
    }),
  })
)

export default class Controller {
  async handle({ auth, bouncer, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(input)
    const workspace = await Workspace.findOrFail(payload.params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('view', workspace)

    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .firstOrFail()

    return {
      member: await member.transformer.serialize(),
    }
  }
}
