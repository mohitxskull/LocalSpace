import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Credential from './credential.js'

export default class CredentialVerification extends BaseModel {
  static table = dbRef.credentialVerification.table.name

  @column({ isPrimary: true })
  declare credentialId: number

  @column.dateTime()
  declare verifiedAt: DateTime<true> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  @belongsTo(() => Credential)
  declare credential: BelongsTo<typeof Credential>
}
