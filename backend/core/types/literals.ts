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
