import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Workspace from './workspace.js'
import { DateTime } from 'luxon'
import { type WorkspaceMemberRoleT } from '#types/literals'
import { WorkspaceMemberTransformer } from '#transformers/workspace_member'
import { ulid } from '#config/ulid'

export default class WorkspaceMember extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.workspaceMember.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare workspaceId: string

  @column()
  declare role: WorkspaceMemberRoleT

  @column.dateTime()
  declare joinedAt: DateTime<true> | null

  @column.dateTime()
  declare leftAt: DateTime<true> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: Workspace) {
    row.id = ulid()
  }

  // Relations =========================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  // Extra =============================

  declare $extras: { total: number }

  get transformer() {
    return new WorkspaceMemberTransformer(this)
  }
}
