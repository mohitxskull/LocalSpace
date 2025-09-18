import User from '#models/user'
import Workspace from '#models/workspace'
import Blog from '#models/blog'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class BlogPolicy {
  private checkWorkspace(workspace: Workspace, blog: Blog) {
    if (workspace.id !== blog.workspaceId) {
      throw new Error('Workspace mismatch', {
        cause: {
          workspaceId: workspace.id,
          blogWorkspaceId: blog.workspaceId,
        },
      })
    }
  }

  async create(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })
  }

  async view(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    return await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })
  }

  async update(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    return await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })
  }

  async delete(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    return await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })
  }

  async publish(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    return await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })
  }
}
