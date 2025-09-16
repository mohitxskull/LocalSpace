import { DBReference, TableReference } from '@localspace/node-lib'

const dbStructure = {
  user: {
    name: 'users',
    columns: {
      id: 'id',
      name: 'name',
      role: 'role',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  credential: {
    name: 'credentials',
    columns: {
      id: 'id',
      userId: 'user_id',
      type: 'type',
      identifier: 'identifier',
      password: 'password',
      usedAt: 'used_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  credentialVerification: {
    name: 'credential_verifications',
    columns: {
      credentialId: 'credential_id',
      verifiedAt: 'verified_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  customerProfile: {
    name: 'customer_profiles',
    columns: {
      userId: 'user_id',
      email: 'email',
      updatedAt: 'updated_at',
    },
  },
  adminProfile: {
    name: 'admin_profiles',
    columns: {
      userId: 'user_id',
      email: 'email',
      updatedAt: 'updated_at',
    },
  },
  workspace: {
    name: 'workspaces',
    columns: {
      id: 'id',
      name: 'name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  workspaceMember: {
    name: 'workspace_members',
    columns: {
      id: 'id',
      userId: 'user_id',
      workspaceId: 'workspace_id',
      role: 'role',
      joinedAt: 'joined_at',
    },
    pivot: {
      pivotTable: 'workspace_members',
      pivotForeignKey: 'user_id',
      pivotRelatedForeignKey: 'workspace_id',
      pivotColumns: ['role', 'joined_at'],
    },
  },
  permissions: {
    name: 'permissions',
    columns: {
      id: 'id',
      userId: 'user_id',
      riPattern: 'ri_pattern',
      actions: 'actions',
      grantedAt: 'granted_at',
    },
  },
  blog: {
    name: 'blogs',
    columns: {
      id: 'id',
      workspaceId: 'workspace_id',
      authorId: 'author_id',
      title: 'title',
      content: 'content',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  token: {
    name: 'tokens',
    columns: {
      id: 'id',
      tokenableId: 'tokenable_id',
      type: 'type',
      name: 'name',
      hash: 'hash',
      abilities: 'abilities',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastUsedAt: 'last_used_at',
      expiresAt: 'expires_at',
    },
  },
  rateLimit: {
    name: 'rate_limits',
    columns: {
      key: 'key',
      points: 'points',
      expire: 'expire',
    },
  },
} as const satisfies TableReference

export const dbRef = DBReference.create(dbStructure)
