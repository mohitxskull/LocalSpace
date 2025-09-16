import { setting } from '#config/setting'
import Credential from '#models/credential'
import User from '#models/user'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import { BaseMail } from '@adonisjs/mail'
import { TokenHolder as AccessTokenHolder } from '#modules/token_module'

export default class PasswordResetNotification extends BaseMail {
  subject = 'Reset your password'

  constructor(
    private params: {
      user: User
      credential: Credential
      accessTokenHolder: AccessTokenHolder
    }
  ) {
    super()
    if (this.params.credential.type !== 'email') {
      throw new Error('Invalid credential type', {
        cause: this.params.credential.toJSON(),
      })
    }
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const userName = this.params.user.name
    const email = this.params.credential.identifier

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
