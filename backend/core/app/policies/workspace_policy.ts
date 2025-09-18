import User from '#models/user'
import Workspace from '#models/workspace'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class WorkspacePolicy {
  async view(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return !!(await workspace.getMember({ user }))
  }

  async update(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })
  }

  async delete(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner'] })
  }

  async transfer(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner'] })
  }

  async manageMembers(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })
  }
}
