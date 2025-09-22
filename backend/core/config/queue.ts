import { defineConfig } from '@nemoventures/adonis-jobs'
import { RedisCheck, RedisMemoryUsageCheck } from '@adonisjs/redis'
import stringHelpers from '@adonisjs/core/helpers/string'

const queueConfig = defineConfig({
  /**
   * The default connection to use. The connection
   * should be defined in the "config/redis.ts" file.
   */
  connection: { connectionName: 'main' },

  multiLogger: {
    enabled: true,
  },

  /**
   * When enabled, all queues will use the same Redis connection instance.
   * This is the recommended setting for most applications.
   */
  useSharedConnection: true,

  /**
   * Health check configuration for your workers.
   */
  healthCheck: {
    enabled: true,
    endpoint: '/internal/healthz',
    checks: ({ connection }) => [
      new RedisCheck(connection),
      new RedisMemoryUsageCheck(connection).warnWhenExceeds('100MB').failWhenExceeds('200MB'),
    ],
  },

  /**
   * The name of the queue to use when no queue is explicitly specified
   * during job dispatching.
   */
  defaultQueue: 'sendEmail',

  /**
   * Configure your queues here. Each queue can have its own connection,
   * worker options, and job options
   */
  queues: {
    sendEmail: {
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 10,
      },

      defaultWorkerOptions: {
        concurrency: 5,
        removeOnComplete: { count: 5, age: stringHelpers.milliseconds.parse('1d') },
        removeOnFail: { count: 5, age: stringHelpers.milliseconds.parse('2d') },
      },
    },
  },
})

export default queueConfig

declare module '@nemoventures/adonis-jobs/types' {
  interface Queues extends InferQueues<typeof queueConfig> {}
}
