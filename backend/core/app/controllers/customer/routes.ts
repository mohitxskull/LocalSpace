import router from '@adonisjs/core/services/router'
import { customerAuthRoutes } from './auth/routes.js'
import { customerWorkspaceRoutes } from './workspace/routes.js'

export const customerRoutes = () => {
  router
    .group(() => {
      customerAuthRoutes()
      customerWorkspaceRoutes()
    })
    .prefix('customer')
    .as('customer')
}
