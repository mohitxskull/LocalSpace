import type Permission from '#models/permission'
import { BaseTransformer } from '@localspace/node-lib'

export class PermissionTransformer extends BaseTransformer<Permission> {
  async serialize() {
    return {
      id: this.resource.id,
      resourceType: this.resource.resourceType,
      resourceId: this.resource.resourceId,
      actions: this.resource.actions,
      grantedAt: this.datetime(this.resource.grantedAt),
    }
  }
}
