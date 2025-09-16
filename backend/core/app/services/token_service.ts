import app from '@adonisjs/core/services/app'
import type AccessTokenModule from '#modules/token_module'

let tokenService: AccessTokenModule

await app.booted(async () => {
  tokenService = await app.container.make('token')
})

export { tokenService as default }
