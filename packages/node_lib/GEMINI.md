# Node Lib (`@localspace/node-lib`)

This package contains shared, reusable Node.js utilities specifically tailored for the AdonisJS backend in the LocalSpace monorepo.

## Core Utilities

### `DBReference`

*   **File:** `src/db_reference.ts`
*   **Purpose:** A powerful factory class that creates a type-safe, deeply-nested object representing the entire database schema (tables, columns, and pivot options). This eliminates the use of magic strings for database identifiers in the application code, improving maintainability and reducing runtime errors.
*   **Usage:** Define the schema structure and pass it to `DBReference.create()`. The resulting object provides auto-completion and compile-time checks for all table and column names.

### `BaseTransformer`

*   **File:** `src/base_transformer.ts`
*   **Purpose:** An abstract class designed for transforming (serializing) Lucid ORM models into consistent JSON objects for API responses. It provides helper methods like `pick`, `omit`, and a standardized `datetime` serializer.
*   **Usage:** Extend this class for a specific model, implement the `serialize` method, and use it to control the shape of the data sent to the client.

### `HTTPException` Framework

*   **Files:** `src/exceptions/`
*   **Purpose:** A robust exception handling framework.
    *   `http_exception.ts`: A base `HTTPException` class that integrates with AdonisJS's handler and reporter, providing a structured format for API errors (`status`, `code`, `message`, `metadata`, etc.).
    *   `list.ts`: A pre-defined list of concrete exception classes for common HTTP statuses (e.g., `BadRequestException`, `NotFoundException`, `InternalServerErrorException`).
    *   `parse_error.ts`: A crucial utility function that intercepts various error types (like VineJS validation errors or generic AdonisJS exceptions) and converts them into a standardized `HTTPException`. This ensures all errors returned by the API have a consistent format.

### `ScopedCache`

*   **File:** `src/scoped_cache.ts`
*   **Purpose:** A sophisticated, type-safe utility for managing hierarchical cached data. It simplifies working with namespaced cache keys, allowing for the creation of nested caches (e.g., a user's cache containing a nested cache for their posts).
*   **Features:**
    *   Automatic namespacing.
    *   `getOrSet` logic with a factory function.
    *   Hierarchical extension (`.extend()`) and derivation (`.derive()`).
    *   Methods for peeking, deleting, and clearing namespaces.

### `BaseCacher`

*   **File:** `src/base_cacher.ts`
*   **Purpose:** An abstract class to create type-safe cacher services for Lucid models, integrating with the `@adonisjs/cache` provider.
