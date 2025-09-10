import vine from '@vinejs/vine'
import { accessTokenTypeC, credentialTypeC } from '#types/literals'

export const PageS = () => vine.number().min(1).max(100)

export const LimitS = () => vine.number().min(1).max(100)

export const DirectionS = () => vine.enum(['asc', 'desc'])

export const HashS = () =>
  vine
    .string()
    .fixedLength(32)
    .regex(/^[a-z0-9]+$/)

export const CredentialTypeS = () => vine.enum(credentialTypeC)

export const AccessTokenTypeS = () => vine.enum(accessTokenTypeC)
