import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Test your code here in the playground'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Playground started')

    this.logger.info('Playground completed')
  }
}
