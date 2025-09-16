# Backend Core (`@localspace/backend-core`)

This is the core backend service for LocalSpace, built with the AdonisJS v6 framework.

## Key Technologies & Libraries

- **Framework:** [AdonisJS](https://adonisjs.com/) v6
- **Database:** [AdonisJS Lucid ORM](https://docs.adonisjs.com/guides/database/lucid) (MySQL in production, SQLite for tests)
- **Authentication:** `@adonisjs/auth` using API tokens.
- **Validation:** [VineJS](https://vinejs.dev/) for request validation.
- **API Generation:** `@tuyau/core` for automatically generating API type definitions from controllers.
- **Queues:** `bullmq` integrated via `@nemoventures/adonis-jobs` for background jobs like sending emails.
- **Email:** `@adonisjs/mail` for sending transactional emails.
- **Caching:** `@adonisjs/cache` with a multi-layer setup (in-memory L1, Redis L2).
- **Rate Limiting:** `@adonisjs/limiter` to protect against brute-force attacks.
- **Authorization:** `@adonisjs/bouncer` for defining authorization policies and abilities.
- **File Storage:** `@adonisjs/drive` for handling file storage.
- **Real-time:** `@adonisjs/transmit` for real-time communication.
- **Testing:** [Japa](https://japa.dev/) for functional and unit testing.

## Project Structure Highlights

- **Configuration:** All major configurations are in the `config/` directory. `config/setting.ts` contains business-logic settings.
- **Routes:** Defined in `start/routes.ts`, which delegates to controller-specific route files (e.g., `app/controllers/customer/routes.ts`).
- **Controllers:** Located in `app/controllers/`, organized by domain (e.g., `customer`, `admin`).
- **Models:** Lucid models are in `app/models/`. The project uses ULIDs for primary keys on most models.
- **Database Schema:** The `database/reference.ts` file uses the `@localspace/node-lib` package to create a type-safe `dbRef` object for all table and column names, preventing magic strings in queries.
- **Middleware:** Custom middleware is located in `app/middleware/`.
- **Services:** The `app/services/` directory contains service singletons (e.g., `token_service`).
- **Transformers:** `app/transformers/` contains classes for serializing Lucid models into API responses, using the `BaseTransformer` from `@localspace/node-lib`.

## Testing with Japa

AdonisJS provides built-in testing support using Japa. Tests are organized into `functional` and `unit` suites within the `tests` directory and can be run using `node ace test`.

Key features include:

- **Configuration**: Test suites, runner hooks, plugins, and reporters are configured in `adonisrc.ts` and `tests/bootstrap.ts`.
- **Creation**: New tests are generated with `node ace make:test <name> --suite=<suite_name>`.
- **Writing Tests**: Tests are defined using `test` and `test.group` methods, supporting lifecycle hooks for setup/teardown.
- **Running Tests**: Options include filtering by title, file, group, or tags; watching for file changes; retrying failed tests; and using specific reporters.
- **Environment**: A `.env.test` file can be used for test-specific environment variables, taking precedence over `.env`.

---

## Development Learnings & Conventions

This section documents the key conventions and workflows established for this project.

### 1. General Workflow

- **Frequent Checks:** Run `pnpm check` often to catch linting and type-checking errors early in the development process.
- **Avoid `@ts-ignore`:** Do not use `@ts-ignore` to hide compiler errors. Address the underlying type issue directly.

### 2. Database and Migrations

- **`dbRef` is the Source of Truth:** The `database/reference.ts` file is the single source of truth for all database table and column names. All schema changes must be defined here first.
- **Use `dbRef` in Queries:** Always use the `dbRef` object when building database queries to avoid magic strings and ensure consistency (e.g., `.where(dbRef.workspaceMember.userId, user.id)`).
- **Migrations:**
  - Run `ace` commands from within the `backend/core` directory (e.g., `cd backend/core && node ace make:migration ...`).
  - During development, it is acceptable to modify existing migration files. Use `node ace migration:fresh` to reset the database and apply all schema changes from the beginning.

### 3. Controllers and Routes

- **Single-Action Controllers:** Each controller file should be responsible for a single action or endpoint. This promotes clean, focused controllers.
- **Directory Structure:** Organize controllers into subdirectories based on the resource they manage (e.g., `app/controllers/customer/workspace/member/store_controller.ts`).
- **Route Definitions:**
  - Use nested groups and prefixes in `routes.ts` files to keep the definitions clean, organized, and DRY.
  - Do not use a leading slash (`/`) in prefix definitions (e.g., `.prefix('workspace')`, not `.prefix('/workspace')`).
  - Use singular resource names in URLs (e.g., `/workspace` instead of `/workspaces`).

### 4. Internationalization (i18n)

- **Use for All User-Facing Messages:** All strings that will be displayed to the user, including success messages and errors, must be handled by the `i18n` service.
- **Nested Key Convention:** Use a nested, dot-notation key structure in the `resources/lang/en/customer.json` file. The preferred convention is `[resource].[action].[key]` (e.g., `customer.workspace.permission.update.success`).
- **Usage:** Access translations in controllers via the `ctx.i18n` object (e.g., `i18n.t('customer.workspace.delete.success')`).

### 5. Authorization (Bouncer)

- **Policies:** Authorization logic is encapsulated in policy classes located in `app/policies`. These are simple classes that do not extend a base class.
- **Registration:** Register all policies in `app/policies/main.ts`.
- **Usage:** Use `bouncer.with('PolicyName').authorize('ability', resource)` in controllers to protect endpoints. The bouncer instance is automatically initialized with the authenticated user.

### 6. Services and IoC Container

- **Service Providers:** Use existing service providers like `BootProvider` to register new singleton services into the IoC container.
- **Service Files:** Create dedicated service files (e.g., `app/services/ri_service.ts`) to export and provide easy access to container-managed instances. This keeps controllers and other parts of the application clean.

### 7. Local Packages (`@localspace/node-lib`)

- **`RIManager`:** This class from the `@localspace/node-lib` package is central to the permissions system. It should be used for defining, parsing, and matching resource identifiers.
- **Exports:** To make a module from a local package available to other packages in the monorepo, it must be exported from that package's main `index.ts` file.
- **Building:** After modifying the source code of a local package, it **must be rebuilt** (e.g., `pnpm --filter @localspace/node-lib build`) for the changes to be reflected in the other packages that consume it.
