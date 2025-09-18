import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Workspace from './workspace.js'
import { blogStatusE, type BlogStatusT } from '#types/literals'
import { BlogTransformer } from '#transformers/blog'
import WorkspaceMember from './workspace_member.js'

export default class Blog extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.blog.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare workspaceId: string

  @column()
  declare authorId: string

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare status: BlogStatusT

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: Blog) {
    row.id = ulid()
  }

  // Relations =========================

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  @belongsTo(() => WorkspaceMember, {
    foreignKey: dbRef.blog.authorId,
  })
  declare author: BelongsTo<typeof WorkspaceMember>

  // Extra =============================

  declare $extras: { total: number }

  get transformer() {
    return new BlogTransformer(this)
  }

  get isDraft() {
    return this.status === blogStatusE('draft')
  }

  get isPublished() {
    return this.status === blogStatusE('published')
  }

  get isArchived() {
    return this.status === blogStatusE('archived')
  }
}
