import type User from '#models/user'
import { BaseTransformer } from '@localspace/node-lib'

export class UserTransformer extends BaseTransformer<User> {
  async serialize() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }

  async customer() {
    return {
      id: this.resource.id,
      name: this.resource.name,
    }
  }
}
