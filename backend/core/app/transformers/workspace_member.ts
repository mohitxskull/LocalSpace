import WorkspaceMember from '#models/workspace_member'
import { BaseTransformer } from '@localspace/node-lib'

export class WorkspaceMemberTransformer extends BaseTransformer<WorkspaceMember> {
  async serialize() {
    return {
      id: this.resource.id,
      userId: this.resource.userId,
      workspaceId: this.resource.workspaceId,
      role: this.resource.role,
      joinedAt: this.datetime(this.resource.joinedAt),
      leftAt: this.datetime(this.resource.leftAt),
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }
}
