import { monotonicFactory } from 'ulid'

/**
 * ULID (Universally Unique Lexicographically Sortable Identifier) generator instance.
 *
 * ULIDs are 26-character case-insensitive strings that combine:
 * - 48-bit timestamp (millisecond precision)
 * - 80-bit randomness
 *
 * Benefits over UUIDs:
 * - Lexicographically sortable (natural ordering by creation time)
 * - More compact representation (26 chars vs 36 for UUID)
 * - URL-safe (no special characters)
 * - Case insensitive
 *
 * The monotonicFactory ensures that consecutive ULIDs generated within the same
 * millisecond will be lexicographically ordered, which is crucial for database
 * indexing performance and maintaining creation order even under high load.
 *
 * Used throughout the application for:
 * - Database primary keys
 * - Entity identifiers
 * - Job IDs and tracking references
 * - API resource identifiers
 */
export const ulid = monotonicFactory()

export const ULID_LENGTH = 26
