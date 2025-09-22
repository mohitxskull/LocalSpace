import * as z from 'zod'

// --- Zod Schemas for Validation ---

/**
 * Zod schema for validating pivot table timestamp options.
 * Allows a boolean or a detailed object for createdAt/updatedAt columns.
 */
const PivotTimestampsSchema = z.union([
  z.boolean(),
  z.object({
    createdAt: z.union([z.string(), z.boolean()]),
    updatedAt: z.union([z.string(), z.boolean()]),
  }),
])

/**
 * Zod schema for validating pivot table options in a many-to-many relationship.
 */
const PivotOptionsSchema = z.object({
  pivotTable: z.string(),
  pivotColumns: z.array(z.string()).optional(),
  localKey: z.string().optional(),
  pivotForeignKey: z.string().optional(),
  relatedKey: z.string().optional(),
  pivotRelatedForeignKey: z.string().optional(),
  pivotTimestamps: PivotTimestampsSchema.optional(),
  serializeAs: z.string().nullish(),
  meta: z.any().optional(),
})

/**
 * Zod schema for a single table entry in the database structure.
 */
const TableEntrySchema = z.object({
  name: z.string(),
  pivot: PivotOptionsSchema.optional(),
  columns: z.record(z.string(), z.string()),
})

/**
 * Zod schema for the entire table reference structure.
 */
const TableReferenceSchema = z.record(z.string(), TableEntrySchema)

// --- TypeScript Types ---

/** Type definition for pivot options, inferred from the Zod schema. */
export type PivotOptions = z.infer<typeof PivotOptionsSchema>

/** Type definition for the table reference structure, inferred from the Zod schema. */
export type TableReference = z.infer<typeof TableReferenceSchema>

/**
 * A function-like type for accessing column names with an optional prefix.
 * Also includes direct readonly properties for each column.
 */
type ColumnsAccessor<T extends TableReference[keyof TableReference]> = (<
  K extends keyof T['columns'],
>(
  columnKey: K
) => string) & { readonly [K in keyof T['columns']]: T['columns'][K] }

/**
 * Helper type for creating aliased column keys (e.g., `userIdC`).
 * This maps each column key `someKey` to a new property `someKeyC`
 * whose value is the original key as a string literal ('someKey').
 */
type ColumnAliasProperties<T extends TableReference[keyof TableReference]> = {
  readonly [K in keyof T['columns'] as `${string & K}C`]: K
}

/**
 * The main accessor for a single table.
 * - `table`: Contains metadata and helper functions (`name`, `columns`, `pivot`).
 * - Direct properties: For direct access to column names (e.g., `dbRef.user.userId`).
 * - Aliased properties: For accessing the original key (e.g., `dbRef.user.userIdC`).
 */
type TableAccessor<T extends TableReference[keyof TableReference]> = {
  readonly table: {
    readonly name: T['name']
    readonly columns: ColumnsAccessor<T>
    readonly pivot: 'pivot' extends keyof T
      ? (customOptions?: Partial<PivotOptions>) => PivotOptions | undefined
      : never
  }
} & {
  readonly [K in keyof T['columns']]: T['columns'][K]
} & ColumnAliasProperties<T>

/** The complete, type-safe database reference object. */
type DBReferenceObject<T extends TableReference> = {
  readonly [K in keyof T]: TableAccessor<T[K]>
}

/**
 * A factory class for creating a type-safe database reference object.
 * This class should not be instantiated directly; use the static `create` method.
 */
export class DBReference {
  private constructor() {}

  /**
   * Creates a type-safe, deeply-nested object for database schema references.
   * This object provides autocompletion and compile-time checks for table and column names.
   *
   * @param structure The database structure object, which **must** be declared with `as const`
   *                  to preserve the literal types for type safety.
   * @returns A frozen, type-safe object representing the database schema.
   *
   * @example
   * const dbStructure = {
   *   user: { name: 'users', columns: { id: 'id', email: 'email' } },
   * } as const satisfies TableReference;
   *
   * export const dbRef = DBReference.create(dbStructure);
   *
   * // Usage:
   * dbRef.user.table.name; // 'users'
   * dbRef.user.email;      // 'email'
   * dbRef.user.emailC;     // 'email' (the key)
   * dbRef.user.table.columns('email'); // 'users.email'
   */
  public static create<T extends TableReference>(structure: T): DBReferenceObject<T> {
    // Validate the structure against the Zod schema at runtime.
    TableReferenceSchema.parse(structure)

    const dbReferenceObject = {} as { [K in keyof T]: TableAccessor<T[K]> }

    for (const key in structure) {
      if (Object.prototype.hasOwnProperty.call(structure, key)) {
        const tableName = key as keyof T
        const tableConfig = structure[tableName]
        const rawColumns = tableConfig.columns

        // Create a function that can return fully qualified column names.
        const columnsAccessor = (<K extends keyof typeof rawColumns>(columnKey: K) => {
          return `${tableConfig.name}.${rawColumns[columnKey]}`
        }) as ColumnsAccessor<typeof tableConfig>

        // Attach direct column name properties to the accessor function.
        for (const colKey in rawColumns) {
          if (Object.prototype.hasOwnProperty.call(rawColumns, colKey)) {
            Object.defineProperty(columnsAccessor, colKey, {
              value: rawColumns[colKey as keyof typeof rawColumns],
              enumerable: true,
              writable: false, // Match the `readonly` type
              configurable: true,
            })
          }
        }

        // Create the aliased column properties (e.g., { userIdC: 'userId' }).
        const columnAliases = Object.keys(rawColumns).reduce(
          (acc, colKey) => {
            ;(acc as any)[`${colKey}C`] = colKey
            return acc
          },
          {} as ColumnAliasProperties<typeof tableConfig>
        )

        // Construct the final accessor object for the table.
        const tableAccessor = {
          table: {
            name: tableConfig.name,
            columns: columnsAccessor,
            // The pivot function is only available if a pivot config is defined.
            pivot: ((customOptions?: Partial<PivotOptions>) => {
              if (!tableConfig.pivot && !customOptions) return undefined
              return {
                ...(tableConfig.pivot || {}),
                ...(customOptions || {}),
              } as PivotOptions
            }) as any,
          },
          ...rawColumns,
          ...columnAliases,
        }

        dbReferenceObject[tableName] = tableAccessor as unknown as TableAccessor<T[keyof T]>
      }
    }

    return dbReferenceObject as DBReferenceObject<T>
  }
}
