## ADDED Requirements

### Requirement: Owner can create a todo list

The system SHALL allow an authenticated user to create a todo list owned by that user. The list MUST have a `title` and MAY have an optional `description`. The `is_public` flag MUST default to `false` (private).

#### Scenario: Create private list

- **WHEN** an authenticated user sends `POST /todo-lists` with a valid `title`
- **THEN** the system creates a list with `user_id` equal to the JWT `sub` and `is_public` false
- **THEN** the response returns the list with its `id` (UUID) and metadata

#### Scenario: Create public list

- **WHEN** an authenticated user sends `POST /todo-lists` with `is_public: true`
- **THEN** the system creates a list marked as public

### Requirement: Owner can list own todo lists

The system SHALL return all non-deleted todo lists owned by the authenticated user via `GET /todo-lists`.

#### Scenario: List own lists

- **WHEN** an authenticated user requests `GET /todo-lists`
- **THEN** the system returns only lists where `user_id` matches the JWT `sub`

### Requirement: User can browse public lists from others

The system SHALL expose `GET /todo-lists/public` returning public lists owned by users other than the requester.

#### Scenario: Browse public lists

- **WHEN** an authenticated user requests `GET /todo-lists/public`
- **THEN** the system returns lists with `is_public` true and `user_id` different from the JWT `sub`
- **THEN** each list includes minimal owner info (`id`, `first_name`, `last_name`)

### Requirement: Read access respects visibility

The system SHALL allow `GET /todo-lists/:id` when the requester is the owner OR the list is public. For private lists of other users, the system MUST respond with `404 Not Found`.

#### Scenario: Owner reads own list

- **WHEN** the owner requests `GET /todo-lists/:id`
- **THEN** the system returns the list details

#### Scenario: Other user reads public list

- **WHEN** a non-owner requests `GET /todo-lists/:id` for a public list
- **THEN** the system returns the list details

#### Scenario: Other user cannot read private list

- **WHEN** a non-owner requests `GET /todo-lists/:id` for a private list
- **THEN** the system responds with `404 Not Found`

### Requirement: Only owner can update or delete a list

The system SHALL allow `PATCH` and `DELETE` on `/todo-lists/:id` only when the JWT `sub` matches the list `user_id`. Non-owners MUST receive `403 Forbidden`.

#### Scenario: Owner updates list

- **WHEN** the owner sends `PATCH /todo-lists/:id` with `title`, `description`, or `is_public`
- **THEN** the system persists the changes and returns the updated list

#### Scenario: Non-owner cannot update list

- **WHEN** a non-owner sends `PATCH /todo-lists/:id`
- **THEN** the system responds with `403 Forbidden`

#### Scenario: Owner deletes list

- **WHEN** the owner sends `DELETE /todo-lists/:id`
- **THEN** the system soft-deletes the list and its items

### Requirement: Route access requires permission modules

All todo-list endpoints MUST be protected by JWT authentication and the existing `PermissionsGuard`. Users without the required module-route bindings MUST receive `403 Forbidden` before domain checks.

#### Scenario: User without module permission

- **WHEN** an authenticated user without the bound module-route calls `GET /todo-lists`
- **THEN** the `PermissionsGuard` responds with `403 Forbidden`
