import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { JSONColumn } from '@localspace/node-lib/column/json'
import { PermissionTransformer } from '#transformers/permission'

export default class Permission extends BaseModel {
  static table = dbRef.permission.table.name

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare riPattern: string

  @column(JSONColumn())
  declare actions: string[]

  @column.dateTime({ autoCreate: true })
  declare grantedAt: DateTime<true>

  // Relations =========================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  get transformer() {
    return new PermissionTransformer(this)
  }
}
