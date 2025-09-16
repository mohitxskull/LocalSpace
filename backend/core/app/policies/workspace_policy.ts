import User from '#models/user'
import Workspace from '#models/workspace'
import { workspaceMemberRoleE } from '#types/literals'
import { dbRef } from '#database/reference'

export default class WorkspacePolicy {
  async view(user: User, workspace: Workspace): Promise<boolean> {
    const isMember = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .first()
    return !!isMember
  }

  async update(user: User, workspace: Workspace): Promise<boolean> {
    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .first()
    return member?.role === workspaceMemberRoleE('owner')
  }

  async delete(user: User, workspace: Workspace): Promise<boolean> {
    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .first()
    return member?.role === workspaceMemberRoleE('owner')
  }

  async transfer(user: User, workspace: Workspace): Promise<boolean> {
    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .first()
    return member?.role === workspaceMemberRoleE('owner')
  }

  async manageMembers(user: User, workspace: Workspace): Promise<boolean> {
    const member = await workspace
      .related('members')
      .query()
      .where(dbRef.workspaceMember.userId, user.id)
      .first()
    return member?.role === workspaceMemberRoleE('owner')
  }
}
