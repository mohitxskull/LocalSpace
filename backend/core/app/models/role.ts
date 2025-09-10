import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import { dbRef } from '#database/reference'
import Membership from './membership.js'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { type RoleT } from '#types/literals'

export default class Role extends BaseModel {
  static table = dbRef.role.table.name

  // Columns =============================

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: RoleT

  // Relations =========================

  @hasMany(() => Membership)
  declare memberships: HasMany<typeof Membership>

  @manyToMany(() => User, dbRef.membership.table.pivot())
  declare users: ManyToMany<typeof User>
}
