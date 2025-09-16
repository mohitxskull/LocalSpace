import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import riManager from '#services/ri_service'
import { permissionsSchema } from '#config/permissions'
import Permission from '#models/permission'
import User from '#models/user'

export default class ShowController {
  async handle({ bouncer, params }: HttpContext) {
    const workspace = await Workspace.findOrFail(params.workspaceId)
    await bouncer.with('WorkspacePolicy').authorize('manageMembers', workspace)

    const member = await User.findOrFail(params.memberId)
    const memberPermissions = await Permission.query().where('user_id', member.id)

    const response: any = {
      workspace: [],
      blogs: [],
    }

    // Handle workspace permissions
    for (const action in permissionsSchema.workspace.actions) {
      const actionDef =
        permissionsSchema.workspace.actions[
          action as keyof typeof permissionsSchema.workspace.actions
        ]
      const ri = riManager.build().workspace(workspace.id).toString()
      const hasPermission = memberPermissions.some(
        (p) => riManager.matches(p.riPattern, ri) && p.actions.includes(action)
      )
      response.workspace.push({
        key: action,
        name: actionDef.name,
        description: actionDef.description,
        selected: hasPermission,
      })
    }

    // Handle blog permissions
    const blogs = await workspace.related('blogs').query()
    const blogActions = permissionsSchema.workspace.child.blog.actions

    for (const blog of blogs) {
      const blogPermissions: any[] = []
      for (const action in blogActions) {
        const actionDef = blogActions[action as keyof typeof blogActions]
        const ri = riManager.build().workspace(workspace.id).blog(blog.id).toString()

        const hasPermission = memberPermissions.some(
          (p) => riManager.matches(p.riPattern, ri) && p.actions.includes(action)
        )

        blogPermissions.push({
          key: action,
          name: actionDef.name,
          description: actionDef.description,
          selected: hasPermission,
        })
      }
      response.blogs.push({
        resourceId: blog.id,
        title: blog.title,
        permissions: blogPermissions,
      })
    }

    return response
  }
}
