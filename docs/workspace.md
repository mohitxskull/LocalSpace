
# Workspace & Blog Feature: Detailed Implementation Plan

This document outlines the complete plan for implementing the workspace and blog features, including a detailed permissions system with a two-role (`owner`, `member`) model.

---

### 1. Core Workspace & Ownership Model

This part establishes the foundation for workspaces, members, and clear ownership.

*   **Database & Models:**
    1.  **`workspaces` Table:**
        *   **Migration:** The table will contain the workspace `id` and `name`.
    2.  **`workspace_members` Table:**
        *   **Migration:** The existing migration is suitable. The `role` column will store either `owner` or `member`. A user with the `owner` role is the designated owner of the workspace.
        *   **Model:** The `WorkspaceMember` model will define the many-to-many relationship between `Users` and `Workspaces`.
    3.  **`users` Table:**
        *   **Model:** The `User` model will have a `workspaces: ManyToMany<typeof Workspace>` relationship.

*   **Business Logic & API:**
    1.  **User Signup & Workspace Creation:**
        *   When a new customer signs up, I will create a default workspace for them and add them to the `workspace_members` table with the `owner` role.
        *   When a user creates a new workspace via the API (`POST /api/v1/customer/workspace`), I will first check if they own fewer than 5 workspaces (by counting their `owner` roles in the `workspace_members` table). If the check passes, I will create the `Workspace` and the corresponding `workspace_members` entry making them the `owner`.
    2.  **Ownership Transfer:**
        *   **Endpoint:** `POST /api/v1/customer/workspace/:workspaceId/transfer`
        *   **Authorization:** Only the current `owner` of the workspace can call this endpoint.
        *   **Logic:** The endpoint will accept a `newOwnerId` in the request body. In a single database transaction, it will:
            1.  Update the old owner's role in `workspace_members` from `owner` to `member`.
            2.  Update the new owner's role in `workspace_members` to `owner`.

---

### 2. Blog Feature

This part introduces the `blogs` entity, scoped within each workspace.

*   **Database & Models:**
    1.  **`blogs` Table:** I will create a migration for a `blogs` table with columns: `id`, `workspace_id`, `author_id`, `title`, `content`, and `status` (`draft`, `published`, `archived`).
    2.  **Model Relationships:** The `Blog` model will be linked to `Workspace` (`belongsTo`) and `User` (`belongsTo` as author).

*   **Blog API:**
    *   All blog endpoints will be nested under a workspace: `/api/v1/customer/workspace/:workspaceId/blog`.
    *   I will implement full CRUD and status management endpoints.

---

### 3. Advanced Permissions System (Detailed)

This section explains the fine-grained access control for workspace `members`, which will be built around the **`RIManager`** from `@localspace/node_lib`.

*   **Permission Strategy:**
    *   **Core Tooling:** The `RIManager` will be the heart of the permission system. I will create a central `ResourceSchema` in a `config/permissions.ts` file that defines all application resources (`workspace`, `blog`), their child relationships, and all possible actions with names and descriptions, as required by the `RIManager`.
    *   **`owner` Role:** Has all permissions implicitly. Bouncer checks for this role will always return `true`.
    *   **`member` Role:** Has no permissions by default. All abilities must be explicitly granted.
    *   **`permissions` Table:** I will update the migration for this table. Instead of `resourceType` and `resourceId`, it will have a single `ri_pattern` column. This column will store a Resource Identifier pattern (e.g., `ri:localspace:workspace:ID:blog:*`) that the user is granted access to. The `actions` column will store the comma-separated list of actions allowed for that pattern.

*   **How to Manage and Fetch Permissions (API):**

    *   **A) Fetching a Member's Permissions for Editing:**
        *   **Endpoint:** `GET /api/v1/customer/workspace/:workspaceId/permission/:memberId`
        *   **Authorization:** Only the workspace `owner` can access this.
        *   **Response Logic:** The backend will use the `RIManager`'s schema to generate a list of all possible permissions for all resources within the workspace. It will then check which of these are granted to the member (by using `riManager.matches()` against the member's grants in the `permissions` table) and return the full list with a `selected: boolean` property on each.

    *   **B) Updating a Member's Permissions:**
        *   **Endpoint:** `PUT /api/v1/customer/workspace/:workspaceId/permission/:memberId`
        *   **Authorization:** Only the workspace `owner` can access this.
        *   **Request Body:** The body will contain a list of permission grants. This is extremely powerful as it allows granting permissions on specific resources or with wildcards.
            ```json
            {
              "grants": [
                { "ri": "ri:localspace:workspace:ID:blog:*", "actions": ["read"] },
                { "ri": "ri:localspace:workspace:ID:blog:BLOG_ID_1", "actions": ["update", "delete"] }
              ]
            }
            ```
        *   **Backend Logic:** The backend will replace all existing grants for the member in that workspace with the new set provided in the request.

*   **How a Logged-in User Fetches Their Own Permissions:**
    *   The `GET /api/v1/customer/workspace/:workspaceId/me` endpoint remains the best approach. The response will be a simple map of the action keys they have been granted, which is efficient for the client.

*   **Bouncer Policy Implementation with RIManager:**
    *   The Bouncer policies will be clean and powerful.
        ```typescript
        // In BlogPolicy.ts
        async update(user: User, blog: Blog) {
          // 1. Check for owner role.
          const member = await WorkspaceMember.find(...);
          if (member?.role === 'owner') return true;

          // 2. Build the specific RI for the resource being accessed.
          const blogRI = riManager.build().workspace(blog.workspaceId).blog(blog.id).toString();

          // 3. Check against the user's grants.
          const userGrants = await Permission.query().where('userId', user.id);
          for (const grant of userGrants) {
            if (riManager.matches(grant.ri_pattern, blogRI) && grant.actions.includes('update')) {
              return true; // Permission granted!
            }
          }

          return false;
        }
        ```
This `RIManager`-based approach provides a robust, scalable, and type-safe foundation for the entire permission system.
