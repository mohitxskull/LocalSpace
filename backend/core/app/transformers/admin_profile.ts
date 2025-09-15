import AdminProfile from '#models/admin_profile'
import { BaseTransformer } from '@localspace/node-lib'

export class AdminProfileTransformer extends BaseTransformer<AdminProfile> {
  async serialize() {
    return {
      email: this.resource.email,
    }
  }
}
