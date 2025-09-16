import { RoleT } from '#types/literals'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { ForbiddenException } from '@localspace/node-lib/exception'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options?: {
      roles?: RoleT[]
    }
  ) {
    await ctx.auth.authenticateUsing(['api'])

    if (options?.roles) {
      const user = ctx.auth.getUserOrFail()

      if (!options.roles.includes(user.role)) {
        throw new ForbiddenException()
      }
    }

    return await next()
  }
}
