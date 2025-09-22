import { UseQueryResult } from '@tanstack/react-query'
import React from 'react'

// Define a more flexible type for props that can be a render function or a static node
type RenderProp<T> = React.ReactNode | ((props: T) => React.ReactNode)

// Helper function to resolve the RenderProp
const renderContent = <T,>(content: RenderProp<T>, props: T): React.ReactNode => {
  if (typeof content === 'function') {
    return content(props)
  }
  return content
}

export type QueryLoaderProps<TData, TError> = {
  /** The query result object from a useQuery hook. */
  query: UseQueryResult<TData, TError>
  /** * A render prop that receives the non-nullable data when the query is successful and data is present.
   * Renders only in the final success state.
   */
  children: (data: NonNullable<TData>) => React.ReactNode
  /** Custom content to display while loading. Defaults to a simple "Loading..." text. */
  loading?: React.ReactNode
  /** * Custom content for the error state. Can be a static node or a function that receives the error object.
   * Defaults to a simple "Error" text.
   */
  error?: RenderProp<{ error: TError }>
  /**
   * Optional boolean to indicate that the data, while present, is considered "empty" (e.g., an empty array).
   * If `true`, the `empty` prop will be rendered instead of `children`.
   */
  isEmpty?: boolean
  /** Custom content to display when `isEmpty` is true. Defaults to "No data". */
  empty?: React.ReactNode
}

/**
 * A declarative component to handle the various states of a TanStack Query.
 * It simplifies rendering logic by handling loading, error, and empty states,
 * allowing you to focus on the success state.
 * @template TData The type of the data returned by the query.
 * @template TError The type of the error returned by the query.
 */
export const QueryLoader = <TData, TError = Error>({
  query,
  children,
  loading = 'Loading...',
  error: errorContent = 'An error occurred.',
  isEmpty = false,
  empty = 'No data',
}: QueryLoaderProps<TData, TError>) => {
  const { data, isLoading, isError, error } = query

  if (isLoading) {
    return <>{loading}</>
  }

  if (isError) {
    // The error object from react-query is of type TError, but can be null
    // We cast to TError as it's guaranteed to be present in the isError state.
    return <>{renderContent(errorContent, { error: error as TError })}</>
  }

  // At this point, isLoading and isError are false.
  // We check for the explicit isEmpty flag first.
  if (isEmpty) {
    return <>{empty}</>
  }

  // Finally, if data is present and not considered empty, render the children.
  if (data !== null && data !== undefined) {
    // The NonNullable cast is safe here due to the check above.
    return <>{children(data as NonNullable<TData>)}</>
  }

  // Fallback for cases where data is null/undefined but not caught by isEmpty
  return <>{empty}</>
}
