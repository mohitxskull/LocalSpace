import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.token.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments(dbRef.token.id)

      t.string(dbRef.token.tokenableId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.token.type).notNullable()
      t.string(dbRef.token.name).nullable()
      t.string(dbRef.token.hash).notNullable()
      t.text(dbRef.token.abilities).notNullable()
      t.timestamp(dbRef.token.createdAt)
      t.timestamp(dbRef.token.updatedAt)
      t.timestamp(dbRef.token.lastUsedAt).nullable()
      t.timestamp(dbRef.token.expiresAt).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
