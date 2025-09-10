import ActionToken from '#models/action_token'
import Credential from '#models/credential'
import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

export default class VerifyEmailNotification extends BaseMail {
  subject = 'Verify your email'

  constructor(
    private params: {
      user: User
      credential: Credential
      actionToken: ActionToken
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

    this.message.to('user@example.com')
  }
}
