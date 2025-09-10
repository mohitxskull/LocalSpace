import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import {
  AccessToken as AccessTokenHolderOriginal,
  DbAccessTokensProvider,
} from '@adonisjs/auth/access_tokens'
import { dbRef } from '#database/reference'
import { ulid } from '#config/ulid'
import Membership from './membership.js'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.js'
import Credential from './credential.js'
import Permission from './permission.js'
import CustomerProfile from './customer_profile.js'
import AdminProfile from './admin_profile.js'
import { UserTransformer } from '#transformers/user'
import { setting } from '#config/setting'
import { AccessTokenManager } from '#miscellaneous/access_token_manager'
import AccessToken from './access_token.js'
import { accessTokenTypeE } from '#types/literals'

export default class User extends BaseModel {
  static selfAssignPrimaryKey = true
  static table = dbRef.user.table.name

  static authAccessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: setting.session.expiresIn,
    type: accessTokenTypeE('auth'),
    table: dbRef.accessToken.table.name,
    prefix: AccessTokenManager.prefix,
  })

  declare currentAccessToken: AccessTokenHolderOriginal

  // Columns ===========================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime<true>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime<true>

  // Hooks =============================

  @beforeCreate()
  static assignUlid(row: User) {
    row.id = ulid()
  }

  // Relations =========================

  @hasMany(() => Credential)
  declare credentials: HasMany<typeof Credential>

  @hasMany(() => Permission)
  declare permissions: HasMany<typeof Permission>

  @hasOne(() => CustomerProfile)
  declare customerProfile: HasOne<typeof CustomerProfile>

  @hasOne(() => AdminProfile)
  declare adminProfile: HasOne<typeof AdminProfile>

  @hasMany(() => Membership)
  declare memberships: HasMany<typeof Membership>

  @hasMany(() => AccessToken)
  declare accessTokens: HasMany<typeof AccessToken>

  @manyToMany(() => Role, dbRef.membership.table.pivot())
  declare roles: ManyToMany<typeof Role>

  // Extra =============================

  get transformer() {
    return new UserTransformer(this)
  }
}
