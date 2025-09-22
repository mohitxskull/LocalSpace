import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Experimental flags
  |--------------------------------------------------------------------------
  |
  | The following features will be enabled by default in the next major release
  | of AdonisJS. You can opt into them today to avoid any breaking changes
  | during upgrade.
  |
  */
  experimental: {
    mergeMultipartFieldsAndFiles: true,
    shutdownInReverseOrder: true,
  },

  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@tuyau/core/commands'),
    () => import('@adonisjs/bouncer/commands'),
    () => import('@adonisjs/mail/commands'),
    () => import('@nemoventures/adonis-jobs/commands'),
    () => import('@adonisjs/cache/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@tuyau/core/tuyau_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    () => import('@adonisjs/bouncer/bouncer_provider'),
    () => import('@adonisjs/drive/drive_provider'),
    () => import('@adonisjs/redis/redis_provider'),
    () => import('#providers/boot_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@nemoventures/adonis-jobs/queue_provider'),
    () => import('@julr/adonisjs-prometheus/prometheus_provider'),
    () => import('@adonisjs/cache/cache_provider'),
    () => import('@adonisjs/core/providers/edge_provider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    () => import('#start/routes'),
    () => import('#start/kernel'),
    () => import('#start/mail'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec(.ts|.js)'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/functional/**/*.spec(.ts|.js)'],
        name: 'functional',
        timeout: 30000,
      },
      {
        files: ['tests/browser/**/*.spec(.ts|.js)'],
        name: 'browser',
        timeout: 300000,
      },
    ],
    forceExit: false,
  },

  directories: {
    jobs: 'app/jobs',
  },

  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
  ],
})
