import SendEmailJob from '#jobs/send_email_job'
import mail from '@adonisjs/mail/services/main'

mail.setMessenger((mailer) => {
  return {
    async queue(mailMessage, config) {
      await SendEmailJob.dispatch({
        mailMessage,
        config,
        mailerName: mailer.name,
      })
    },
  }
})
