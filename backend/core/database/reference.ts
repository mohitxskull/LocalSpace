import { DBReference, TableReference } from '@localspace/node-lib'

const dbStructure = {
  user: {
    name: 'users',
    columns: {
      id: 'id',
      name: 'name',
      role: 'role',
      email: 'email',
      password: 'password',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      verifiedAt: 'verified_at',
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
      leftAt: 'left_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  blog: {
    name: 'blogs',
    columns: {
      id: 'id',
      workspaceId: 'workspace_id',
      authorId: 'author_id', // Workspace Member ID
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
