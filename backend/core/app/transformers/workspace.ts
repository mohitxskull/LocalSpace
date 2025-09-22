import Workspace from '#models/workspace'
import { BaseTransformer } from '@localspace/node-lib'

export class WorkspaceTransformer extends BaseTransformer<Workspace> {
  async serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }
}
