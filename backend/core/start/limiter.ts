/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const userLimiter = limiter.define('user', (ctx) => {
  const user = ctx.auth.user

  if (!user) {
    return null
  }

  return limiter.allowRequests(100).every('1 minute').usingKey(user.id).blockFor('1 hour')
})
