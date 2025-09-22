/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { userLimiter } from './limiter.js'
import { customerRoutes } from '#controllers/customer/routes'

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            customerRoutes()

            router.get('ping', [() => import('#controllers/ping_controller')]).as('ping')
          })
          .prefix('v1')
          .as('v1')
      })
      .prefix('api')
      .as('api')
  })
  .use([userLimiter])
