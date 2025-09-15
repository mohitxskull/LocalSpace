import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class AdminProfile extends BaseModel {
  static table = dbRef.adminProfile.table.name

  // Columns ===========================

  @column({ isPrimary: true })
  declare userId: string

  @column()
  declare email: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Relations =========================

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
