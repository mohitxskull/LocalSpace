import CredentialVerification from '#models/credential_verification'
import { BaseTransformer } from '@localspace/node-lib'

export class CredentialVerificationTransformer extends BaseTransformer<CredentialVerification> {
  async serialize() {
    return {
      credentialId: this.resource.credentialId,
      verifiedAt: this.datetime(this.resource.verifiedAt),
      createdAt: this.datetime(this.resource.createdAt),
      updatedAt: this.datetime(this.resource.updatedAt),
    }
  }
}
