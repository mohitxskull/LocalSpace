import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'
import { defineConfig as defineDumperConfig } from '@adonisjs/core/dumper'

/**
 * The app key is used for encrypting cookies, generating signed URLs,
 * and by the "encryption" module.
 *
 * The encryption module will fail to decrypt data if the key is lost or
 * changed. Therefore it is recommended to keep the app key secure.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,

  /**
   * Enabling async local storage will let you access HTTP context
   * from anywhere inside your application.
   */
  useAsyncLocalStorage: false,

  /**
   * Manage cookies configuration. The settings for the session id cookie are
   * defined inside the "config/session.ts" file.
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  trustProxy: () => true,
})

/**
 * The global configuration used by the "dd" helper. You can
 * separately configure the settings for both the "console"
 * and the "html" printers.
 */
export const dumper = defineDumperConfig({
  /**
   * Settings for the console printer
   */
  console: {
    depth: 10,

    /**
     * Objects that should not be further expanded. The
     * array accepts an array of object constructor
     * names.
     */
    collapse: ['DateTime', 'Date'],
    inspectStaticMembers: true,
  },

  /**
   * Settings for the HTML printer
   */
  html: {
    depth: 10,
    inspectStaticMembers: true,
  },
})
