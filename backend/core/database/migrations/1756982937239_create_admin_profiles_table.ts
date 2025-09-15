import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.adminProfile.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.string(dbRef.adminProfile.userId, ULID_LENGTH)
        .primary()
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')
      t.string(dbRef.adminProfile.email).notNullable()
      t.timestamp(dbRef.adminProfile.updatedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
