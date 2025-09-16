import { dbRef } from '#database/reference'
import Workspace from '#models/workspace'
import WorkspaceMember from '#models/workspace_member'
import { QueryClientContract } from '@adonisjs/lucid/types/database'
import { BaseCacher, ScopedCache } from '@localspace/node-lib'
import { promiseMap } from '@localspace/lib'

export class WorkspaceCacher extends BaseCacher<typeof Workspace, string> {
  members(
    params: { workspace: Workspace },
    options?: {
      client?: QueryClientContract
    }
  ) {
    return ScopedCache.create(this.space({ id: params.workspace.id }), {
      key: 'members',
      factory: async () => {
        const workspaceMembers = await WorkspaceMember.query({ client: options?.client }).where(
          dbRef.workspaceMember.workspaceId,
          params.workspace.id
        )

        return await promiseMap(workspaceMembers, async (m) => await m.transformer.serialize())
      },
    })
  }
}
