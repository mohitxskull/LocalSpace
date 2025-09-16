import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Workspace from './workspace.js'
import User from './user.js'
import { type BlogStatusT } from '#types/literals'
import { BlogTransformer } from '#transformers/blog'

export default class Blog extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.blog.table.name

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
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUlid(row: Blog) {
    row.id = ulid()
  }

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>

  @belongsTo(() => User, {
    foreignKey: dbRef.blog.authorId,
  })
  declare author: BelongsTo<typeof User>

  get transformer() {
    return new BlogTransformer(this)
  }
}
