import User from '#models/user'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import { BaseMail } from '@adonisjs/mail'
import { TokenHolder as AccessTokenHolder } from '#modules/token_module'
import { getSetting } from '#util/get_setting'

export default class PasswordResetNotification extends BaseMail {
  subject = 'Reset your password'

  constructor(
    private params: {
      user: User
      accessTokenHolder: AccessTokenHolder
    }
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const setting = getSetting()
    const userName = this.params.user.name
    const email = this.params.user.email

    const url = router
      .builder()
      .disableRouteLookup()
      .prefixUrl(new URL(env.get('APP_CLIENT_URL')).origin)
      .qs({ token: this.params.accessTokenHolder.getValueOrFail().release() })
      .make(setting.credential.email.passwordReset.path)

    this.message.to(email)
    this.message.htmlView('emails/password_reset', {
      url,
      user: { name: userName },
    })
  }
}
