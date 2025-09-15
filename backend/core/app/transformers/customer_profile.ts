import type CustomerProfile from '#models/customer_profile'
import { BaseTransformer } from '@localspace/node-lib'

export class CustomerProfileTransformer extends BaseTransformer<CustomerProfile> {
  async serialize() {
    return {
      email: this.resource.email,
    }
  }
}
