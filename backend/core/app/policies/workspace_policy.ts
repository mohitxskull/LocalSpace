import User from '#models/user'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class WorkspacePolicy {
  private async isOwner(user: User, workspace: Workspace): Promise<boolean> {
    const members = await Workspace.cacher.members({ workspace }).get()

    const member = members.find((m) => m.userId === user.id)

    if (!member) return false

    return member.role === workspaceMemberRoleE('owner')
  }

  async view(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    const workspaceMembers = await Workspace.cacher.members({ workspace }).get()
    return workspaceMembers.some((workspaceMember) => workspaceMember.userId === user.id)
  }

  async update(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return this.isOwner(user, workspace)
  }

  async delete(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return this.isOwner(user, workspace)
  }

  async transfer(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return this.isOwner(user, workspace)
  }

  async manageMembers(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return this.isOwner(user, workspace)
  }
}
