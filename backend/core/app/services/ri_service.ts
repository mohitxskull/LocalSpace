import app from '@adonisjs/core/services/app'
import { RIManager } from '@localspace/node-lib'
import { permissionsSchema } from '#config/permissions'

let riManager: RIManager<typeof permissionsSchema>

await app.booted(async () => {
  riManager = await app.container.make('riManager')
})

export { riManager as default }
