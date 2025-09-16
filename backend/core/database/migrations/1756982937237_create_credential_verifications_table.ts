import { dbRef } from '#database/reference'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = dbRef.credentialVerification.table.name

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.integer(dbRef.credentialVerification.credentialId)
        .unsigned()
        .primary()
        .notNullable()
        .references(dbRef.credential.table.columns('id'))
        .onDelete('CASCADE')

      t.timestamp(dbRef.credentialVerification.verifiedAt).nullable()
      t.timestamp(dbRef.credentialVerification.createdAt).notNullable()
      t.timestamp(dbRef.credentialVerification.updatedAt).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
