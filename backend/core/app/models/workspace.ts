import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import WorkspaceMember from './workspace_member.js'
import Blog from './blog.js'
import { WorkspaceTransformer } from '#transformers/workspace'
import { WorkspaceCacher } from '#cacher/workspace'
import cache from '@adonisjs/cache/services/main'
import User from './user.js'
import { WorkspaceMemberRoleT } from '#types/literals'
import { NotFoundException } from '@localspace/node-lib/exception'
import { WorkspaceHelper } from '#helper/workspace'

export default class Workspace extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.workspace.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: Workspace) {
    row.id = ulid()
  }

  // Relations =========================

  @hasMany(() => WorkspaceMember)
  declare members: HasMany<typeof WorkspaceMember>

  @hasMany(() => Blog)
  declare blogs: HasMany<typeof Blog>

  // Extra =============================

  get transformer() {
    return new WorkspaceTransformer(this)
  }

  get helper() {
    return new WorkspaceHelper(this)
  }

  static get cacher() {
    return new WorkspaceCacher(Workspace, cache.namespace(this.table))
  }

  async getMember(params: { user: User }) {
    const members = await Workspace.cacher.getActiveMembers({ workspace: this }).get()

    return members.find((m) => m.userId === params.user.id)
  }

  async getMemberOrFail(params: { user: User }) {
    const member = await this.getMember({ user: params.user })

    if (!member) {
      throw new NotFoundException(`Workspace member for user ${params.user.id} not found`)
    }

    return member
  }

  async memberHasRole(params: { user: User; roles: WorkspaceMemberRoleT[] }) {
    const member = await this.getMember({ user: params.user })

    if (!member) return false

    return params.roles.includes(member.role)
  }
}
