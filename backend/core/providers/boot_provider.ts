import type { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'
import ace from '@adonisjs/core/services/ace'
import db from '@adonisjs/lucid/services/db'
import TokenModule from '#modules/token_module'

export default class BootProvider {
  constructor(protected app: ApplicationService) {
    this.app.usingVineJS = true
  }

  isSuitableEnv = () => {
    return ['web'].includes(this.app.getEnvironment())
  }

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton(TokenModule, () => {
      return new TokenModule()
    })
    this.app.container.alias('token', TokenModule)
  }

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {
    if (this.isSuitableEnv()) {
      await ace.boot()

      if (ace.hasCommand('migration:run')) {
        try {
          await ace.exec('migration:run', ['--force'])
        } catch (error) {
          logger.error({ err: error })

          await this.app.terminate()
        }
      } else {
        logger.error('migration command not found')
      }
    }
  }

  /**
   * The process has been started
   */
  async ready() {
    if (this.isSuitableEnv()) {
      logger.info('bootstrapping the application.')

      const trx = await db.transaction()

      try {
        await trx.commit()
      } catch (error) {
        await trx.rollback()

        throw error
      }

      logger.info('application bootstrapping completed.')
    }
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {}
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    token: TokenModule
  }
}
