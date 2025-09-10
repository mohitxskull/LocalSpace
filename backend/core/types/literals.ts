const identityOf =
  <T>() =>
  <const U extends T>(value: U) =>
    value

export const accessTokenTypeC = ['email_verification', 'password_reset', 'auth'] as const

export type AccessTokenTypeT = (typeof accessTokenTypeC)[number]

export const accessTokenTypeE = identityOf<AccessTokenTypeT>()

// ===================================

export const credentialTypeC = ['email'] as const

export type CredentialTypeT = (typeof credentialTypeC)[number]

export const credentialTypeE = identityOf<CredentialTypeT>()

// ===================================

export const roleC = ['admin', 'customer'] as const

export type RoleT = (typeof roleC)[number]

export const roleE = identityOf<RoleT>()
