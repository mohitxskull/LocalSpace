const identityOf =
  <T>() =>
  <const U extends T>(value: U) =>
    value

export const tokenTypeC = ['access', 'email_verification', 'password_reset'] as const

export type TokenTypeT = (typeof tokenTypeC)[number]

export const tokenTypeE = identityOf<TokenTypeT>()

// ===================================

export const credentialTypeC = ['email'] as const

export type CredentialTypeT = (typeof credentialTypeC)[number]

export const credentialTypeE = identityOf<CredentialTypeT>()

// ===================================

export const credentialStatusC = ['active', 'bounced', 'complained'] as const

export type CredentialStatusT = (typeof credentialStatusC)[number]

export const credentialStatusE = identityOf<CredentialStatusT>()

// ===================================

export const roleC = ['admin', 'customer'] as const

export type RoleT = (typeof roleC)[number]

export const roleE = identityOf<RoleT>()

// ===================================

export const workspaceMemberRoleC = ['owner', 'member'] as const

export type WorkspaceMemberRoleT = (typeof workspaceMemberRoleC)[number]

export const workspaceMemberRoleE = identityOf<WorkspaceMemberRoleT>()
