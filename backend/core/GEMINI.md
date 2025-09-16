# Backend Core (`@localspace/backend-core`)

This is the core backend service for LocalSpace, built with the AdonisJS v6 framework.

## Key Technologies & Libraries

*   **Framework:** [AdonisJS](https://adonisjs.com/) v6
*   **Database:** [AdonisJS Lucid ORM](https://docs.adonisjs.com/guides/database/lucid) (MySQL in production, SQLite for tests)
*   **Authentication:** `@adonisjs/auth` using API tokens.
*   **Validation:** [VineJS](https://vinejs.dev/) for request validation.
*   **API Generation:** `@tuyau/core` for automatically generating API type definitions from controllers.
*   **Queues:** `bullmq` integrated via `@nemoventures/adonis-jobs` for background jobs like sending emails.
*   **Email:** `@adonisjs/mail` for sending transactional emails.
*   **Caching:** `@adonisjs/cache` with a multi-layer setup (in-memory L1, Redis L2).
*   **Rate Limiting:** `@adonisjs/limiter` to protect against brute-force attacks.
*   **Authorization:** `@adonisjs/bouncer` for defining authorization policies and abilities.
*   **File Storage:** `@adonisjs/drive` for handling file storage.
*   **Real-time:** `@adonisjs/transmit` for real-time communication.
*   **Testing:** [Japa](https://japa.dev/) for functional and unit testing.

## Project Structure Highlights

*   **Configuration:** All major configurations are in the `config/` directory. `config/setting.ts` contains business-logic settings.
*   **Routes:** Defined in `start/routes.ts`, which delegates to controller-specific route files (e.g., `app/controllers/customer/routes.ts`).
*   **Controllers:** Located in `app/controllers/`, organized by domain (e.g., `customer`, `admin`).
*   **Models:** Lucid models are in `app/models/`. The project uses ULIDs for primary keys on most models.
*   **Database Schema:** The `database/reference.ts` file uses the `@localspace/node-lib` package to create a type-safe `dbRef` object for all table and column names, preventing magic strings in queries.
*   **Middleware:** Custom middleware is located in `app/middleware/`.
*   **Services:** The `app/services/` directory contains service singletons (e.g., `token_service`).
*   **Transformers:** `app/transformers/` contains classes for serializing Lucid models into API responses, using the `BaseTransformer` from `@localspace/node-lib`.

## Testing with Japa

AdonisJS provides built-in testing support using Japa. Tests are organized into `functional` and `unit` suites within the `tests` directory and can be run using `node ace test`.

Key features include:
- **Configuration**: Test suites, runner hooks, plugins, and reporters are configured in `adonisrc.ts` and `tests/bootstrap.ts`.
- **Creation**: New tests are generated with `node ace make:test <name> --suite=<suite_name>`.
- **Writing Tests**: Tests are defined using `test` and `test.group` methods, supporting lifecycle hooks for setup/teardown.
- **Running Tests**: Options include filtering by title, file, group, or tags; watching for file changes; retrying failed tests; and using specific reporters.
- **Environment**: A `.env.test` file can be used for test-specific environment variables, taking precedence over `.env`.