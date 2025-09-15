# Project Overview

This is a monorepo for a web application called "LocalSpace". It consists of a frontend application, a backend application, and shared packages. The project is managed with pnpm workspaces and Turborepo.

## Backend

The backend is a Node.js application built with the [AdonisJS](https://adonisjs.com/) framework. It uses a MySQL database and includes features like authentication, caching, and email services.

**Key technologies:**

*   AdonisJS
*   MySQL
*   Redis
*   BullMQ for queues
*   VineJS for validation

## Frontend

The frontend is a [Next.js](https://nextjs.org/) application built with React. It uses the [Mantine](https://mantine.dev/) component library for the UI.

**Key technologies:**

*   Next.js
*   React
*   Mantine
*   React Query for data fetching
*   Zod for validation

## Packages

The `packages` directory contains shared code used by both the frontend and backend.

*   `@localspace/lib`: General-purpose utility functions.
*   `@localspace/node-lib`: Utility functions for Node.js environments.
*   `@localspace/ui`: Shared React components.

# Building and Running

The following commands are available at the root of the project:

*   `pnpm dev`: Start the development servers for both the frontend and backend.
*   `pnpm build`: Build the entire project.
*   `pnpm lint`: Lint the codebase.
*   `pnpm typecheck`: Run the TypeScript compiler to check for type errors.
*   `pnpm format`: Format the codebase with Prettier.
*   `pnpm check`: Run all checks (format, lint, typecheck).

# Development Conventions

*   **Code Style:** The project uses Prettier for code formatting and ESLint for linting.
*   **Testing:** The backend uses Japa for testing. The frontend does not have a testing framework configured yet.
*   **Commits:** There are no explicit commit message conventions, but the project uses Git for version control.
