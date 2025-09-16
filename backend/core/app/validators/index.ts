import vine from '@vinejs/vine'
import { tokenTypeC, credentialTypeC, directionC } from '#types/literals'

vine.convertEmptyStringsToNull = true

export const PageS = () => vine.number().min(1).max(100)

export const LimitS = () => vine.number().min(1).max(100)

export const DirectionS = () => vine.enum(directionC)

export const FilterValueS = () => vine.string().minLength(0).maxLength(20).toLowerCase()

export const CredentialTypeS = () => vine.enum(credentialTypeC)

export const TokenTypeS = () => vine.enum(tokenTypeC)

export const ULIDS = () => vine.string().ulid()
