import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.actionToken.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments(dbRef.actionToken.id)

      t.string(dbRef.actionToken.userId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.actionToken.type).notNullable()
      t.string(dbRef.actionToken.hash).notNullable()

      t.timestamp(dbRef.actionToken.expiresAt).nullable()
      t.timestamp(dbRef.actionToken.createdAt)
      t.timestamp(dbRef.actionToken.updatedAt).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
