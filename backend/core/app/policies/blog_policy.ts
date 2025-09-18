import User from '#models/user'
import Workspace from '#models/workspace'
import Blog from '#models/blog'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { AuthorizationResponse } from '@adonisjs/bouncer'

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

    const can = await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })

    if (!can) {
      return can
    }

    if (!blog.isDraft) {
      return AuthorizationResponse.deny('Blog is not in draft status')
    }

    return can
  }

  async delete(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    const can = await workspace.memberHasRole({ user, roles: ['owner', 'manager', 'editor'] })

    if (!can) {
      return can
    }

    if (!blog.isDraft) {
      return AuthorizationResponse.deny('Blog is not in draft status')
    }

    return can
  }

  async publish(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    const can = await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })

    if (!can) {
      return can
    }

    if (!blog.isDraft) {
      return AuthorizationResponse.deny('Blog is not in draft status')
    }

    return can
  }

  async unpublish(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    const can = await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })

    if (!can) {
      return can
    }

    if (blog.isDraft) {
      return AuthorizationResponse.deny('Blog is already in draft status')
    }

    return can
  }

  async archive(user: User, workspace: Workspace, blog: Blog): Promise<AuthorizerResponse> {
    this.checkWorkspace(workspace, blog)

    const can = await workspace.memberHasRole({ user, roles: ['owner', 'manager'] })

    if (!can) {
      return can
    }

    if (!blog.isPublished) {
      return AuthorizationResponse.deny('Blog is not published')
    }

    return can
  }
}
