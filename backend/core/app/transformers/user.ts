import type User from '#models/user'
import { BaseTransformer } from '@localspace/node-lib'

export class UserTransformer extends BaseTransformer<User> {
  async serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }

  async customerProfile() {
    const [row] = await Promise.all([this.serialize(), this.resource.load('customerProfile')])

    return {
      ...row,
      customerProfile: await this.resource.customerProfile.transformer.serialize(),
    }
  }

  async customer() {
    return {
      id: this.resource.id,
      name: this.resource.name,
    }
  }
}
