## MODIFIED Requirements

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
