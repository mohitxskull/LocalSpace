import { ULID_LENGTH } from '#config/ulid'
import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.accessToken.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments(dbRef.accessToken.id)
      t.string(dbRef.accessToken.tokenableId, ULID_LENGTH)
        .notNullable()
        .references(dbRef.user.table.columns('id'))
        .onDelete('CASCADE')

      t.string(dbRef.accessToken.type).notNullable()
      t.string(dbRef.accessToken.name).nullable()
      t.string(dbRef.accessToken.hash).notNullable()
      t.text(dbRef.accessToken.abilities).notNullable()
      t.timestamp(dbRef.accessToken.createdAt)
      t.timestamp(dbRef.accessToken.updatedAt)
      t.timestamp(dbRef.accessToken.lastUsedAt).nullable()
      t.timestamp(dbRef.accessToken.expiresAt).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
