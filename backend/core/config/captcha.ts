import env from '#start/env'
import { CaptchaManager } from '@folie/captcha'
import { TurnstileDriver } from '@folie/captcha/drivers'

export const captcha = new CaptchaManager({
  drivers: {
    default: new TurnstileDriver({
      privateKey: env.get('CAPTCHA_PRIVATE_KEY'),
    }),
  },
  defaultDriver: 'default',
})
