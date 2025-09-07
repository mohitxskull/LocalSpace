import type Role from '#models/role'
import { BaseTransformer } from '@localspace/node-lib'

export class RoleTransformer extends BaseTransformer<Role> {
  async serialize() {
    return {
      name: this.resource.name,
    }
  }
}
