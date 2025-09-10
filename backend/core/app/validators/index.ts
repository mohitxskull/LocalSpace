import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const PageS = () => vine.number().min(1).max(100)

export const LimitS = () => vine.number().min(1).max(100)

export const DirectionS = () => vine.enum(['asc', 'desc'])

export const HashS = () =>
  vine
    .string()
    .fixedLength(32)
    .regex(/^[a-z0-9]+$/)

export const CredentialTypeS = () => vine.enum(['email'])

export type CredentialTypeT = Infer<ReturnType<typeof CredentialTypeS>>

export const ActionTokenTypeS = () => vine.enum(['email_verification', 'password_reset'])

export type ActionTokenTypeT = Infer<ReturnType<typeof ActionTokenTypeS>>
