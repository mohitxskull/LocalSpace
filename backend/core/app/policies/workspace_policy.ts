import User from '#models/user'
import Workspace from '#models/workspace'
import { AuthorizationResponse } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class WorkspacePolicy {
  async view(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return !!(await workspace.getMember({ user }))
  }

  async update(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })
  }

  async delete(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    const can = await workspace.memberHasRole({ user, roles: ['owner'] })

    if (!can) {
      return can
    }

    const blogCount = await workspace.helper.getPublishedBlogCount()

    if (blogCount > 0) {
      return AuthorizationResponse.deny(
        `Workspace has ${blogCount} published blogs, please archive them first`
      )
    }

    const ownedWorkspaceCount = await user.helper.getOwnedWorkspaceCount()

    if (ownedWorkspaceCount < 2) {
      return AuthorizationResponse.deny('Cannot delete the last workspace')
    }

    return can
  }

  async transfer(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner'] })
  }

  async manageMembers(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })
  }
}
