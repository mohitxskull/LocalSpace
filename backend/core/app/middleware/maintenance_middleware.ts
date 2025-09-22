import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ServiceUnavailableException } from '@localspace/node-lib/exception'

export default class MaintenanceMiddleware {
  async handle(_: HttpContext, next: NextFn) {
    if (env.get('MAINTENANCE') === true) {
      throw new ServiceUnavailableException('Server is currently under maintenance.')
    }

    return await next()
  }
}
