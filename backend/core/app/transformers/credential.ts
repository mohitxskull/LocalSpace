import Credential from '#models/credential'
import { BaseTransformer } from '@localspace/node-lib'

export class CredentialTransformer extends BaseTransformer<Credential> {
  async serialize() {
    return {
      id: this.resource.id,
      method: this.resource.type,
      identifier: this.resource.identifier,
    }
  }
}
