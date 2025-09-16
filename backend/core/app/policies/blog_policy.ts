import User from '#models/user'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import riManager from '#services/ri_service'
import Blog from '#models/blog'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class BlogPolicy {
  private async isOwner(user: User, workspace: Workspace): Promise<boolean> {
    const members = await Workspace.cacher.members({ workspace }).get()
    const member = members.find((m) => m.userId === user.id)

    if (!member) return false

    return member.role === workspaceMemberRoleE('owner')
  }

  async create(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return this.isOwner(user, workspace)
  }

  async view(user: User, blog: Blog): Promise<AuthorizerResponse> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission({ riPattern: ri, actions: ['read'] })
  }

  async update(user: User, blog: Blog): Promise<AuthorizerResponse> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission({ riPattern: ri, actions: ['update'] })
  }

  async delete(user: User, blog: Blog): Promise<AuthorizerResponse> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission({ riPattern: ri, actions: ['delete'] })
  }

  async publish(user: User, blog: Blog): Promise<AuthorizerResponse> {
    await blog.load('workspace')
    const isOwner = await this.isOwner(user, blog.workspace)
    if (isOwner) return true

    const ri = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString()
    return user.hasPermission({ riPattern: ri, actions: ['publish'] })
  }
}
