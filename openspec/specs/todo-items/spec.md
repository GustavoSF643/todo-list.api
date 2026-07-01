# todo-items Specification

## Purpose
TBD - created by archiving change todo-lists-domain. Update Purpose after archive.
## Requirements
### Requirement: Owner can add items to a list

The system SHALL allow the list owner to create items via `POST /todo-lists/:listId/items` with a `title`. Items MUST belong to exactly one list. `completed` MUST default to `false`.

#### Scenario: Owner creates item

- **WHEN** the list owner sends `POST /todo-lists/:listId/items` with a valid `title`
- **THEN** the system creates the item linked to the list
- **THEN** the response returns the item with its `id` (UUID)

#### Scenario: Non-owner cannot create item

- **WHEN** a non-owner sends `POST /todo-lists/:listId/items`
- **THEN** the system responds with `403 Forbidden`

### Requirement: Items inherit list read visibility

The system SHALL expose `GET /todo-lists/:listId/items` under the same read rules as the parent list, returning a paginated envelope (`data` + `meta`). Pagination MUST follow the global `listing-pagination` rules.

#### Scenario: Owner lists items with pagination

- **WHEN** the owner requests `GET /todo-lists/:listId/items?page=1&limit=20`
- **THEN** the system returns a paginated list of non-deleted items ordered by `position` then `created_at`

#### Scenario: Non-owner reads items of public list with pagination

- **WHEN** a non-owner requests items of a public list with pagination query params
- **THEN** the system returns paginated items in `data` with accurate `meta`

#### Scenario: Non-owner cannot read items of private list

- **WHEN** a non-owner requests items of a private list
- **THEN** the system responds with `404 Not Found`

### Requirement: Only owner can update or delete items

The system SHALL allow `PATCH` and `DELETE` on `/todo-lists/:listId/items/:itemId` only when the JWT `sub` matches the parent list `user_id`.

#### Scenario: Owner toggles completion

- **WHEN** the owner sends `PATCH` with `completed: true`
- **THEN** the system updates the item and returns the new state

#### Scenario: Owner updates title

- **WHEN** the owner sends `PATCH` with a new `title`
- **THEN** the system updates the item title

#### Scenario: Non-owner cannot modify item

- **WHEN** a non-owner sends `PATCH` or `DELETE` on an item
- **THEN** the system responds with `403 Forbidden`

### Requirement: Deleting a list removes its items

When a todo list is soft-deleted, all associated items MUST be soft-deleted as well.

#### Scenario: Cascade soft delete

- **WHEN** the owner deletes a list via `DELETE /todo-lists/:id`
- **THEN** subsequent `GET /todo-lists/:listId/items` for that list returns `404 Not Found`

