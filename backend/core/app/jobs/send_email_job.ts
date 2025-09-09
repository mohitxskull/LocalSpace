import mail from '@adonisjs/mail/services/main'
import { MessageBodyTemplates } from '@adonisjs/mail/types'
import { NodeMailerMessage } from '@adonisjs/mail/types'
import { Job } from '@nemoventures/adonis-jobs'
import type { BullJobsOptions, Queues } from '@nemoventures/adonis-jobs/types'

export type SendEmailJobInput = {
  mailMessage: {
    message: NodeMailerMessage
    views: MessageBodyTemplates
  }
  config: unknown
  mailerName: string
}

export type SendEmailJobOutput = {
  success: boolean
}

export default class SendEmailJob extends Job<SendEmailJobInput, SendEmailJobOutput> {
  static nameOverride = 'send-email-job'
  static defaultQueue: keyof Queues = 'sendEmail'

  static options: BullJobsOptions = {}

  async process(): Promise<SendEmailJobOutput> {
    const input = this.data

    await mail.use(input.mailerName as any).sendCompiled(input.mailMessage, input.config)

    return { success: true }
  }
}
