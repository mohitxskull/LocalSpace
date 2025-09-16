import app from '@adonisjs/core/services/app'
import { RIManager } from '@localspace/node-lib'
import { permissionSchema } from '#config/permissions'

let riManager: RIManager<typeof permissionSchema>

await app.booted(async () => {
  riManager = await app.container.make('riManager')
})

export { riManager as default }
