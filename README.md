# LocalSpace

LocalSpace is a modern, opinionated, full-stack boilerplate designed to accelerate the development of type-safe web applications. It combines a powerful AdonisJS backend with a reactive Next.js frontend, all managed within a Turborepo monorepo.

---

## Project Status

This project is currently under active development. The status of the individual packages is as follows:

-   **`@backend/core`**: `Stable` - Core API features including authentication, authorization, and workspace management are implemented.
-   **`@frontend/app`**: `Work in Progress` - The frontend application is currently being built out. Core pages like sign-in and sign-up are functional, but more features are planned.
-   **`@localspace/ui`**: `Stable` - Contains a solid foundation of reusable React components and hooks.
-   **`@localspace/lib` & `@localspace/node-lib`**: `Stable` - Shared utility libraries are feature-complete for the current scope.
-   **`@docs`**: `90% Complete` - The documentation site covers the majority of the architecture, packages, and guides. Some sections may require minor updates as the project evolves.

## Features

-   **Full-Stack Type Safety**: End-to-end type safety between the backend and frontend, powered by [tuyau](https://github.com/tuyau-js/tuyau).
-   **Monorepo with Turborepo**: Optimized for managing multi-package JavaScript/TypeScript projects with `pnpm` workspaces.
-   **Batteries-Included Backend**: AdonisJS v6 backend with token-based authentication, authorization (Bouncer), validation (VineJS), and a custom token management module.
-   **Modern Frontend**: Next.js 15+ with React 19, using [Mantine](https://mantine.dev/) for UI components and [TanStack Query](https://tanstack.com/query/latest) for server state management.
-   **Reusable Packages**: Shared internal libraries for UI (`@localspace/ui`), Node.js utilities (`@localspace/node-lib`), and general-purpose helpers (`@localspace/lib`).
-   **Comprehensive Documentation**: A complete documentation site built with [Fumadocs](https://fumadocs.vercel.app/).

## Tech Stack

-   **Monorepo**: [pnpm](https://pnpm.io/), [Turborepo](https://turbo.build/repo)
-   **Backend**: [AdonisJS](https://adonisjs.com/), [TypeScript](https://www.typescriptlang.org/), [Lucid ORM](https://docs.adonisjs.com/guides/database/lucid), [VineJS](https://vinejs.dev/)
-   **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [Mantine](https://mantine.dev/), [TanStack Query](https://tanstack.com/query/latest)
-   **Database**: MySQL / SQLite
-   **Tooling**: ESLint, Prettier, TypeScript

## Getting Started

### Prerequisites

-   Node.js (v20.6.0 or higher)
-   pnpm

### 1. Installation

Clone the repository and install all dependencies from the root directory:

```bash
pnpm install
```

### 2. Environment Setup

The backend requires environment variables to run. Copy the example file:

```bash
cd backend/core
cp .env.example .env
```

Review the `.env` file and fill in any necessary values, such as database credentials or API keys. For more details, see the [Environment Variables documentation](/docs/environment-variables).

### 3. Run the Development Servers

From the root of the project, run the following command to start all applications simultaneously:

```bash
pnpm dev
```

This will start the backend API, the frontend web app, and the documentation site in development mode.

-   **Frontend**: `http://localhost:3000`
-   **Backend**: `http://localhost:3333`
-   **Docs**: `http://localhost:3001`

## Monorepo Structure

-   `backend/core`: The AdonisJS API server.
-   `frontend/app`: The Next.js web application.
-   `docs`: The Fumadocs documentation site.
-   `packages/ui`: Shared React components, hooks, and utilities.
-   `packages/lib`: Shared, environment-agnostic TypeScript utilities.
-   `packages/node-lib`: Shared utilities for the Node.js environment (used by the backend).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
