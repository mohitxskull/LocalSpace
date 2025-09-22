/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  TZ: Env.schema.string(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),

  MAINTENANCE: Env.schema.boolean.optional(),

  APP_NAME: Env.schema.string(),
  APP_KEY: Env.schema.string(),
  APP_URL: Env.schema.string(),
  APP_CLIENT_URL: Env.schema.string(),
  APP_ACCESS_KEY: Env.schema.string(),

  CAPTCHA_PRIVATE_KEY: Env.schema.string(),
  CAPTCHA_OFF: Env.schema.boolean.optional(),

  DB_TYPE: Env.schema.enum(['mysql', 'sqlite'] as const),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_NAME: Env.schema.string(),
  DB_SSL: Env.schema.boolean.optional(),

  LIMITER_STORE: Env.schema.enum(['database', 'memory'] as const),

  DRIVE_DISK: Env.schema.enum(['fs'] as const),

  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  SMTP_HOST: Env.schema.string(),
  SMTP_PORT: Env.schema.string(),
  SMTP_USERNAME: Env.schema.string(),
  SMTP_PASSWORD: Env.schema.string(),
})
