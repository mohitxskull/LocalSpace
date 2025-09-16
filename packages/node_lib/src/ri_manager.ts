import z from 'zod'

/**
 * A utility type to make all properties of an object and its nested objects readonly.
 */
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T

/**
 * Represents a single action with its description.
 * This is part of the new schema structure.
 */
export type ActionDefinition = {
  readonly description: string
  readonly name: string
}

/**
 * Represents a single node in the resource schema.
 * It defines the possible actions as an object and any nested child resources.
 */
export type ResourceSchemaNode = {
  readonly actions: { readonly [key: string]: ActionDefinition }
  readonly child?: { readonly [key: string]: ResourceSchemaNode }
}

/**
 * Represents the top-level structure of the entire resource schema for an application.
 * Keys are the names of the root-level resources.
 */
export type ResourceSchema = {
  readonly [key: string]: ResourceSchemaNode
}

const RESERVED_NAMES = ['toString', 'can', 'authorize', 'getActions'] as const

/**
 * Zod validator for a single resource name (a key in the schema).
 * Enforces that names only contain letters and are not reserved.
 */
const resourceNameValidator = z
  .string()
  .regex(/^[a-zA-Z]+$/, {
    message: 'Resource name must contain only uppercase and lowercase letters.',
  })
  .refine((name) => !RESERVED_NAMES.includes(name as any), {
    message: `Resource name cannot be one of the reserved names: ${RESERVED_NAMES.join(', ')}`,
  })

const actionNameValidator = z.string().regex(/^[a-z]+$/, {
  message: 'Action name must contain only lowercase letters.',
})

/**
 * Zod validator for the new ActionDefinition type.
 */
const actionDefinitionValidator = z
  .object({
    name: z.string(),
    description: z.string(),
  })
  .readonly()

// A lazy-loaded schema is necessary for recursive types like our resource schema.
const baseResourceSchemaNode: z.ZodType<ResourceSchemaNode> = z.lazy(() =>
  z.object({
    // Updated to validate the new actions object structure.
    actions: z.record(actionNameValidator, actionDefinitionValidator).readonly(),
    child: z.record(resourceNameValidator, baseResourceSchemaNode).optional().readonly(),
  })
)

/**
 * Zod validator for the entire ResourceSchema.
 * This ensures the schema provided to RIManager is structurally correct.
 */
export const resourceSchemaValidator = z.record(resourceNameValidator, baseResourceSchemaNode)

/**
 * A TypeScript utility type to safely extract the 'child' schema from a node.
 * If no 'child' exists, it resolves to an empty object.
 */
type Children<S> = S extends { readonly child?: infer C }
  ? C extends { readonly [key: string]: ResourceSchemaNode }
    ? C
    : {}
  : {}

/**
 * The core of the chainable builder's type definition, enhanced for type safety.
 * @template S The current schema level, which must be a map of resource names to schema nodes.
 * @template FinalNode The schema node corresponding to the fully built resource path.
 */
type RIBuilder<
  S extends { readonly [key: string]: ResourceSchemaNode } | {},
  FinalNode extends ResourceSchemaNode | null = null,
> = {
  [K in keyof S & string]: (
    id?: string | '*'
  ) => RIBuilder<Children<S[K]>, S[K] extends ResourceSchemaNode ? S[K] : never>
} & {
  /** Formats the built resource identifier into a string. */
  toString: () => string
  /**
   * Type-safely checks if an action is permitted on the built resource.
   * @param action The action to check. Autocompletes to valid actions for the resource.
   */
  can: (
    // Updated to infer action names from the keys of the actions object.
    action: FinalNode extends ResourceSchemaNode ? keyof FinalNode['actions'] : never
  ) => boolean
  /**
   * Type-safely asserts that an action is permitted, throwing an error if not.
   * @param action The action to authorize. Autocompletes to valid actions for the resource.
   */
  authorize: (
    // Updated to infer action names from the keys of the actions object.
    action: FinalNode extends ResourceSchemaNode ? keyof FinalNode['actions'] : never
  ) => void
  /**
   * Type-safely gets the list of all valid actions for the built resource.
   * @returns A readonly array of action strings.
   */
  getActions: () => FinalNode extends ResourceSchemaNode
    ? ReadonlyArray<keyof FinalNode['actions']>
    : readonly []
}

/**
 * Defines the structure of a successfully parsed RI.
 */
export type ParsedRI = {
  readonly valid: true
  readonly parts: ReadonlyArray<{ type: string; id?: string | '*' }>
  readonly actions: readonly string[]
}

/**
 * Defines the structure of a failed RI parse attempt.
 */
export type InvalidRI = {
  readonly valid: false
  readonly error: string
  readonly parts: ReadonlyArray<{ type: string; id?: string | '*' }>
  readonly actions: readonly []
}

/**
 * Custom error class for errors occurring during the RI building process.
 */
export class RIBuildError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RIBuildError'
  }
}

/**
 * Custom error class for authorization failures.
 */
export class RIAuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RIAuthorizationError'
  }
}

/**
 * Manages Resource Identifiers (RIs) for an application.
 * It provides methods to build, parse, and validate RIs against a predefined schema.
 */
export class RIManager<S extends ResourceSchema> {
  public static readonly RI_PREFIX = 'ri'
  public static readonly SEPARATOR = ':'
  public static readonly WILDCARD = '*'
  private static readonly ULID_REGEX_STRING = '[0-9A-HJKMNP-TV-Z]{26}'
  private static readonly ULID_REGEX = new RegExp(`^${RIManager.ULID_REGEX_STRING}$`)

  /**
   * A regex for structurally validating an RI string.
   * It checks for the correct prefix, app name format, and alternating resource/ID structure.
   * Note: This does not validate against the specific schema, only the general RI format.
   */
  public static readonly RI_REGEX = new RegExp(
    `^${RIManager.RI_PREFIX}:[a-zA-Z0-9-]+` + // Starts with ri:app-name
      `(${RIManager.SEPARATOR}[a-zA-Z]+` + // Must be followed by :resourceType
      `(${RIManager.SEPARATOR}(${RIManager.ULID_REGEX_STRING}|\\*))?` + // Optionally followed by :id or :*
      `)*$`
  )

  private readonly appName: string
  private readonly schema: DeepReadonly<S>

  /**
   * @param appName The name of the application, used as a prefix in the RI string.
   * @param schema The resource schema defining the structure of all possible RIs.
   */
  constructor(appName: string, schema: S) {
    try {
      resourceSchemaValidator.parse(schema)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid resource schema provided: ${error.message}`)
      }
      throw error
    }

    this.appName = appName
    this.schema = schema as DeepReadonly<S>
  }

  /**
   * Creates a type-safe, chainable builder for constructing RI strings.
   * The builder now includes type-safe `can` and `authorize` methods.
   * @returns An RIBuilder instance to start the building chain.
   */
  public build(): RIBuilder<S> {
    const createBuilder = <
      CurrentSchema extends { readonly [key: string]: ResourceSchemaNode } | {},
      FinalNode extends ResourceSchemaNode | null,
    >(
      currentParts: ReadonlyArray<{ type: string; id?: string | '*' }>,
      currentNode: CurrentSchema,
      finalNode: FinalNode
    ): RIBuilder<CurrentSchema, FinalNode> => {
      return new Proxy(
        {},
        {
          get: (_, prop: string) => {
            const riString = this.formatRI(currentParts)

            if (prop === 'toString') return () => riString
            if (prop === 'can') return (action: string) => this.can(riString, action)
            if (prop === 'authorize') return (action: string) => this.authorize(riString, action)
            if (prop === 'getActions') return () => Object.keys(finalNode?.actions ?? {})

            if (!(prop in currentNode)) {
              const validKeys = Object.keys(currentNode).join(', ')
              throw new RIBuildError(
                `Invalid resource type "${prop}" at this level. Valid types are: [${validKeys}]`
              )
            }

            return (id?: string | '*') => {
              if (id !== undefined && id !== RIManager.WILDCARD && !RIManager.ULID_REGEX.test(id)) {
                throw new RIBuildError(
                  `Invalid ID format for "${prop}". Expected a ULID, but received "${id}".`
                )
              }

              const newParts = [...currentParts, { type: prop, id }]
              const nextSchemaNode = (currentNode as any)[prop] as ResourceSchemaNode
              const nextChildSchema = nextSchemaNode?.child ?? {}
              return createBuilder(newParts, nextChildSchema, nextSchemaNode)
            }
          },
        }
      ) as RIBuilder<CurrentSchema, FinalNode>
    }

    return createBuilder([], this.schema, null) as RIBuilder<S>
  }

  /**
   * Parses an RI string, validates it against the schema, and returns a structured result.
   * @param ri The resource identifier string to parse (e.g., "ri:my-app:users:123:posts").
   * @returns A `ParsedRI` object if valid, or an `InvalidRI` object if not.
   */
  public parse(ri: string): ParsedRI | InvalidRI {
    const segments = ri.split(RIManager.SEPARATOR)
    const [riPrefix, appName, ...rest] = segments

    if (riPrefix !== RIManager.RI_PREFIX || appName !== this.appName) {
      return {
        valid: false,
        error: `Invalid RI prefix or app name. Expected "${RIManager.RI_PREFIX}:${this.appName}".`,
        parts: [],
        actions: [],
      }
    }

    const parts: { type: string; id?: string | '*' }[] = []
    let currentNode: DeepReadonly<ResourceSchema | ResourceSchemaNode['child']> = this.schema
    let lastValidNode: DeepReadonly<ResourceSchemaNode> | null = null

    for (let i = 0; i < rest.length; i++) {
      const type = rest[i]
      const schemaNodeForType: DeepReadonly<ResourceSchemaNode> | undefined = (
        currentNode as any
      )?.[type]

      if (!schemaNodeForType) {
        return {
          valid: false,
          error: `Invalid resource type "${type}" in chain.`,
          parts,
          actions: [],
        }
      }

      lastValidNode = schemaNodeForType
      const childSchema: DeepReadonly<ResourceSchemaNode['child']> = schemaNodeForType.child

      const nextSegment = rest[i + 1]

      if (
        nextSegment &&
        (RIManager.ULID_REGEX.test(nextSegment) || nextSegment === RIManager.WILDCARD)
      ) {
        parts.push({ type, id: nextSegment })
        i++
      } else {
        parts.push({ type })
      }

      currentNode = childSchema ?? {}
    }

    return {
      valid: true,
      parts,
      actions: lastValidNode?.actions ? Object.keys(lastValidNode.actions) : [],
    }
  }

  /**
   * A convenience method to quickly check if an RI string is valid against the schema.
   * @param ri The resource identifier string.
   * @returns `true` if the RI is valid, `false` otherwise.
   */
  public validate(ri: string): boolean {
    return this.parse(ri).valid
  }

  /**
   * Gets all ancestor RIs for a given RI, from the immediate parent to the root.
   * @param ri The resource identifier string.
   * @returns An array of ancestor RI strings, starting with the immediate parent.
   */
  public getAncestors(ri: string): string[] {
    const parsed = this.parse(ri)
    if (!parsed.valid) {
      return []
    }

    const ancestors: string[] = []
    for (let i = parsed.parts.length - 1; i > 0; i--) {
      const ancestorParts = parsed.parts.slice(0, i)
      ancestors.push(this.formatRI(ancestorParts))
    }

    return ancestors
  }

  /**
   * Checks if a given action is permitted for a specific resource identifier.
   * @param ri The resource identifier string.
   * @param action The action to check (e.g., "read", "write").
   * @returns `true` if the action is allowed, `false` otherwise.
   */
  public can(ri: string, action: string): boolean {
    const parsed = this.parse(ri)
    return parsed.valid && parsed.actions.includes(action)
  }

  /**
   * Asserts that an action is permitted, throwing an error if not.
   * @param ri The resource identifier string.
   * @param action The action to check.
   * @throws {RIAuthorizationError} If the action is not permitted.
   */
  public authorize(ri: string, action: string): void {
    if (!this.can(ri, action)) {
      throw new RIAuthorizationError(`Action "${action}" is not permitted on resource "${ri}".`)
    }
  }

  /**
   * Checks if a specific RI matches a pattern RI (which can contain wildcards).
   * @param patternRI An RI string that may contain '*' as a wildcard for an ID.
   * @param specificRI An RI string with specific IDs.
   * @param options.allowPrefixMatch If true, the pattern is allowed to be a prefix of the specific RI.
   * @returns `true` if the specific RI matches the pattern.
   */
  public matches(
    patternRI: string,
    specificRI: string,
    options?: { allowPrefixMatch?: boolean }
  ): boolean {
    const parsedPattern = this.parse(patternRI)
    const parsedSpecific = this.parse(specificRI)

    if (!parsedPattern.valid || !parsedSpecific.valid) {
      return false
    }

    const patternParts = parsedPattern.parts
    const specificParts = parsedSpecific.parts

    const allowPrefixMatch = options?.allowPrefixMatch ?? false

    if (!allowPrefixMatch && patternParts.length !== specificParts.length) {
      return false
    }
    if (patternParts.length > specificParts.length) {
      return false
    }

    for (const [i, patternPart] of patternParts.entries()) {
      const specificPart = specificParts[i]

      if (patternPart.type !== specificPart.type) {
        return false
      }

      if (
        patternPart.id !== undefined &&
        patternPart.id !== RIManager.WILDCARD &&
        patternPart.id !== specificPart.id
      ) {
        return false
      }
    }

    return true
  }

  /**
   * Gets the parent resource identifier of a given RI.
   * @param ri The resource identifier string.
   * @returns The parent RI string, or `null` if the RI has no parent.
   */
  public getParent(ri: string): string | null {
    const parsed = this.parse(ri)

    if (!parsed.valid || parsed.parts.length <= 1) {
      return null
    }

    const parentParts = parsed.parts.slice(0, -1)
    return this.formatRI(parentParts)
  }

  /**
   * Extracts ID parameters from an RI string into a key-value object.
   * @param ri The resource identifier string.
   * @returns An object mapping resource types to their IDs.
   */
  public extractParams(ri: string): { [key: string]: string | '*' } {
    const parsed = this.parse(ri)

    if (!parsed.valid) {
      return {}
    }

    return parsed.parts.reduce(
      (acc, part) => {
        if (part.id !== undefined) {
          acc[part.type] = part.id
        }
        return acc
      },
      {} as { [key: string]: string | '*' }
    )
  }

  /**
   * Formats an array of RI parts into a standardized RI string.
   * @param parts The structured parts of the RI.
   * @returns A formatted RI string.
   */
  private formatRI(parts: ReadonlyArray<{ type: string; id?: string | '*' }>): string {
    const chain = parts
      .map((p) => (p.id !== undefined ? `${p.type}${RIManager.SEPARATOR}${p.id}` : p.type))
      .join(RIManager.SEPARATOR)

    return `${RIManager.RI_PREFIX}${RIManager.SEPARATOR}${this.appName}${
      chain ? RIManager.SEPARATOR + chain : ''
    }`
  }
}
