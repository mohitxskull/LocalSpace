import Membership from '#models/membership'
import { BaseTransformer } from '@localspace/node-lib'

export class MembershipTransformer extends BaseTransformer<Membership> {
  async serialize() {
    return {
      id: this.resource.id,
      userId: this.resource.userId,
      roleId: this.resource.roleId,
    }
  }
}
