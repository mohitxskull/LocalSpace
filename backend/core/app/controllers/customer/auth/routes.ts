import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

export const customerAuthRoutes = () => {
  router
    .group(() => {
      router
        .post('sign-in', [() => import('#controllers/customer/auth/sign_in_controller')])
        .use([middleware.captcha()])

      router
        .post('sign-up', [() => import('#controllers/customer/auth/sign_up_controller')])
        .use([middleware.captcha()])

      router
        .group(() => {
          router.get('', [() => import('#controllers/customer/auth/profile/show_controller')])
        })
        .prefix('profile')
        .use([
          middleware.auth({
            roles: ['customer'],
          }),
        ])
    })
    .prefix('auth')
}
