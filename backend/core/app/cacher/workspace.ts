import Workspace from '#models/workspace'
import { BaseCacher, ScopedCache } from '@localspace/node-lib'
import { promiseMap } from '@localspace/lib'

export class WorkspaceCacher extends BaseCacher<typeof Workspace, string> {
  getActiveMembers(params: { workspace: Workspace }) {
    return ScopedCache.create(this.space({ id: params.workspace.id }), {
      key: 'active-members',
      factory: async () => {
        const workspaceMembers = await params.workspace.helper.activeMemberQuery

        return await promiseMap(workspaceMembers, async (m) => await m.transformer.serialize())
      },
    })
  }
}
