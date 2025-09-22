import { dbRef } from '#database/reference'
import Workspace from '#models/workspace'
import { blogStatusE } from '#types/literals'
import { BaseHelper } from '@localspace/node-lib'

export class WorkspaceHelper extends BaseHelper<Workspace> {
  get activeMemberQuery() {
    return this.resource
      .related('members')
      .query()
      .whereNotNull(dbRef.workspaceMember.joinedAt)
      .andWhereNull(dbRef.workspaceMember.leftAt)
  }

  async getPublishedBlogCount(): Promise<number> {
    return await this.resource
      .related('blogs')
      .query()
      .where(dbRef.blog.status, blogStatusE('published'))
      .count('*', 'total')
      .then((result) => result.pop()?.$extras.total || 0)
  }

  async getBlogCount(): Promise<number> {
    return await this.resource
      .related('blogs')
      .query()
      .count('*', 'total')
      .then((result) => result.pop()?.$extras.total || 0)
  }
}
