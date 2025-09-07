import AdminProfile from '#models/admin_profile'
import { BaseTransformer } from '@localspace/node-lib'

export class AdminProfileTransformer extends BaseTransformer<AdminProfile> {
  async serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
    }
  }
}
