import { captcha } from '#config/captcha'
import env from '#start/env'
import { safeEqual } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { BadRequestException } from '@localspace/node-lib/exception'
import vine from '@vinejs/vine'

const schema = vine.compile(
  vine.object({
    headers: vine.object({
      captcha: vine.string().maxLength(2048).minLength(10),
    }),
  })
)

export default class CaptchaMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (env.get('NODE_ENV') === 'test' || env.get('CAPTCHA_OFF') === true) {
      return await next()
    }

    const payload = await ctx.request.validateUsing(schema)

    if (safeEqual(env.get('APP_ACCESS_KEY'), payload.headers.captcha)) {
      ctx.logger.debug('Bypassed captcha using App Access Key')

      return next()
    }

    const [isValid] = await captcha.use().verify({
      token: payload.headers.captcha,
      ip: ctx.request.ip(),
    })

    if (!isValid) {
      throw new BadRequestException('Invalid captcha', {
        reason: {
          token: payload.headers.captcha,
        },
      })
    }

    return await next()
  }
}
