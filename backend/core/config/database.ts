import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_TYPE'),
  connections: {
    mysql: {
      debug: true,
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_NAME'),
        ssl: env.get('DB_SSL') === false ? undefined : {},
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
        disableRollbacksInProduction: true,
      },
    },
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: app.tmpPath(`${env.get('APP_NAME')}_${env.get('NODE_ENV')}_db.sqlite3`),
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: true,
    },
  },
})

export default dbConfig
