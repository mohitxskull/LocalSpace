import { dbRef } from '#database/reference'
import User from '#models/user'
import { workspaceMemberRoleE } from '#types/literals'
import { BaseHelper } from '@localspace/node-lib'

export class UserHelper extends BaseHelper<User> {
  async getOwnedWorkspaceCount(): Promise<number> {
    return await this.resource
      .related('workspaceMember')
      .query()
      .andWhere(dbRef.workspaceMember.role, workspaceMemberRoleE('owner'))
      .count('*', 'total')
      .then((result) => result.pop()?.$extras.total || 0)
  }
}
