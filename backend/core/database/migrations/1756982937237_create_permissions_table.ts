import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.permissions.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments(dbRef.permissions.id)
      t.string(dbRef.permissions.userId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')
      t.string('ri_pattern').notNullable()
      t.string(dbRef.permissions.actions).notNullable()
      t.timestamp(dbRef.permissions.grantedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
