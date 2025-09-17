import User from '#models/user'
import Workspace from '#models/workspace'
import riManager from '#services/ri_service'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class WorkspacePolicy {
  #riPattern(params: { workspace: Workspace }) {
    return riManager.build().workspace(params.workspace.id).toString()
  }

  async view(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    const workspaceMembers = await Workspace.cacher.members({ workspace }).get()
    return workspaceMembers.some((workspaceMember) => workspaceMember.userId === user.id)
  }

  async update(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.isOwner({ user })
  }

  async delete(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.isOwner({ user })
  }

  async transfer(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    return await workspace.isOwner({ user })
  }

  async member(user: User, workspace: Workspace): Promise<AuthorizerResponse> {
    const isOwner = await workspace.isOwner({ user })

    if (isOwner) {
      return true
    }

    const hasPermission = await user.hasPermission({
      riPattern: this.#riPattern({ workspace }),
      actions: ['member'],
    })

    return hasPermission
  }
}
