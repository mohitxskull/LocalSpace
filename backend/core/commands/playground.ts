import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { SecretTokenModule } from '../app/module/secret_token_service.js'

export default class Playground extends BaseCommand {
  static commandName = 'playground'
  static description = 'Test your code here in the playground'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Playground started')

    await this.app.container.make('cache.manager')

    // await mail.send(new VerifyEmailNotification())

    const emailVerificationSecretTokenService = new SecretTokenModule<{
      email: string
    }>({
      expiresIn: '1h',
      purpose: 'goat',
    })

    const tokenA = emailVerificationSecretTokenService.encode({
      email: 'user@example.com',
    })

    const tokenB = emailVerificationSecretTokenService.encode({
      email: 'user@example.com',
    })

    console.log({
      tokenA,
      tokenB,
      equal: tokenA === tokenB,
    })

    this.logger.info('Playground completed')
  }
}
