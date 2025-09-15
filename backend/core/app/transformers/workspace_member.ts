import WorkspaceMember from '#models/workspace_member'
import { BaseTransformer } from '@localspace/node-lib'

export class WorkspaceMemberTransformer extends BaseTransformer<WorkspaceMember> {
  async serialize() {
    return {
      userId: this.resource.userId,
      workspaceId: this.resource.workspaceId,
      role: this.resource.role,
      joinedAt: this.datetime(this.resource.joinedAt),
    }
  }
}
