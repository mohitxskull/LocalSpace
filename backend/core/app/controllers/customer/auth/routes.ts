import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

export const customerAuthRoutes = () => {
  router
    .group(() => {
      router
        .post('signin', [() => import('#controllers/customer/auth/signin_controller')])
        .use([middleware.captcha()])
        .as('signin')

      router
        .post('signup', [() => import('#controllers/customer/auth/signup_controller')])
        .use([middleware.captcha()])
        .as('signup')

      router
        .post('verify', [() => import('#controllers/customer/auth/verify_controller')])
        .use([middleware.captcha()])
        .as('verify')

      router
        .post('verify/resend', [
          () => import('#controllers/customer/auth/verify_resend_controller'),
        ])
        .use([middleware.captcha()])
        .as('verify.resend')

      router
        .group(() => {
          router
            .get('', [() => import('#controllers/customer/auth/profile/show_controller')])
            .as('show')
        })
        .prefix('profile')
        .as('profile')
        .use([
          middleware.auth({
            roles: ['customer'],
          }),
        ])

      router
        .group(() => {
          router
            .group(() => {
              router
                .post('update', [
                  () => import('#controllers/customer/auth/password/update_controller'),
                ])
                .as('update')
            })
            .use([
              middleware.auth({
                roles: ['customer'],
              }),
            ])

          router
            .post('forgot', [() => import('#controllers/customer/auth/password/forgot_controller')])
            .use([middleware.captcha()])
            .as('forgot')

          router
            .post('reset', [() => import('#controllers/customer/auth/password/reset_controller')])
            .use([middleware.captcha()])
            .as('reset')
        })
        .prefix('password')
        .as('password')
    })
    .prefix('auth')
    .as('auth')
}
