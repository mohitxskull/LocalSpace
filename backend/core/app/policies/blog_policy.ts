import User from '#models/user'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import riManager from '#services/ri_service'
import Blog from '#models/blog'

export default class BlogPolicy {
  private async isOwner(user: User, workspace: Workspace): Promise<boolean> {
    const member = await workspace.related('members').query().where('user_id', user.id).first()
    return member?.role === workspaceMemberRoleE('owner')
  }

  async create(user: User, workspace: Workspace): Promise<boolean> {
    return this.isOwner(user, workspace)
  }

  async view(user: User, blog: Blog): Promise<boolean> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission(ri, 'read')
  }

  async update(user: User, blog: Blog): Promise<boolean> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission(ri, 'update')
  }

  async delete(user: User, blog: Blog): Promise<boolean> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission(ri, 'delete')
  }
}
