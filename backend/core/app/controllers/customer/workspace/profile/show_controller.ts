import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import Permission from '#models/permission'
import riManager from '#services/ri_service'

export default class ShowController {
  async handle({ auth, bouncer, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const workspace = await Workspace.findOrFail(params.workspaceId)

    await bouncer.with('WorkspacePolicy').authorize('view', workspace)

    const member = await workspace
      .related('members')
      .query()
      .where('user_id', user.id)
      .firstOrFail()

    if (member.role === workspaceMemberRoleE('owner')) {
      return {
        role: 'owner',
        permissions: { all: true },
      }
    }

    const userPermissions = await Permission.query().where('user_id', user.id)
    const response: any = {
      role: 'member',
      permissions: {
        workspace: [],
        blogs: {},
      },
    }

    for (const p of userPermissions) {
      const parsed = riManager.parse(p.riPattern)
      if (!parsed.valid) continue

      const workspacePart = parsed.parts[0]
      if (
        !workspacePart ||
        workspacePart.type !== 'workspace' ||
        workspacePart.id !== workspace.id
      ) {
        continue
      }

      const actions = p.actions

      if (parsed.parts.length === 1) {
        response.permissions.workspace.push(...actions)
      } else if (parsed.parts.length === 2 && parsed.parts[1].type === 'blog') {
        const blogId = parsed.parts[1].id
        if (blogId && blogId !== '*') {
          if (!response.permissions.blogs[blogId]) {
            response.permissions.blogs[blogId] = []
          }
          response.permissions.blogs[blogId].push(...actions)
        }
      }
    }

    return response
  }
}
