import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Workspace from './workspace.js'
import { DateTime } from 'luxon'
import { type WorkspaceMemberRoleT } from '#types/literals'

export default class WorkspaceMember extends BaseModel {
  static table = dbRef.workspaceMember.table.name

  @column()
  declare userId: string

  @column()
  declare workspaceId: string

  @column()
  declare role: WorkspaceMemberRoleT

  @column.dateTime({ autoCreate: true })
  declare joinedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Workspace)
  declare workspace: BelongsTo<typeof Workspace>
}
