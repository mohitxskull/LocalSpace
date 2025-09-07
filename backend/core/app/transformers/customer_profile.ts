import type CustomerProfile from '#models/customer_profile'
import { BaseTransformer } from '@localspace/node-lib'

export class CustomerProfileTransformer extends BaseTransformer<CustomerProfile> {
  async serialize() {
    return {
      id: this.resource.id,
      email: this.resource.email,
    }
  }
}
