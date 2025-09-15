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
        .post('verify', [() => import('#controllers/customer/auth/verify_controller')])
        .use([middleware.captcha()])

      router
        .post('verify/resend', [() => import('#controllers/customer/auth/verify_resend_controller')])
        .use([middleware.captcha()])

      router
        .post('update-email', [() => import('#controllers/customer/auth/update_email_controller')])
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

      router
        .group(() => {
          router
            .group(() => {
              router.post('update', [
                () => import('#controllers/customer/auth/password/update_controller'),
              ])
            })
            .use([
              middleware.auth({
                roles: ['customer'],
              }),
            ])

          router.post('forgot', [() => import('#controllers/customer/auth/password/forgot_controller')])
          router.post('reset', [() => import('#controllers/customer/auth/password/reset_controller')])
        })
        .prefix('password')
    })
    .prefix('auth')
}
