## MODIFIED Requirements

### Requirement: Owner can list own todo lists

The system SHALL return non-deleted todo lists owned by the authenticated user via `GET /todo-lists` as a paginated envelope (`data` + `meta`). Pagination MUST follow the global `listing-pagination` rules (`page`, `limit`, defaults, clamp).

#### Scenario: List own lists with defaults

- **WHEN** an authenticated user requests `GET /todo-lists` without query params
- **THEN** the system returns `page=1`, `limit=20`, and only lists where `user_id` matches the JWT `sub`

#### Scenario: List own lists with custom page

- **WHEN** an authenticated user requests `GET /todo-lists?page=2&limit=10`
- **THEN** the system returns the second page of owned lists with accurate `meta.total`

### Requirement: User can browse public lists from others

The system SHALL expose `GET /todo-lists/public` returning a paginated envelope of public lists owned by users other than the requester.

#### Scenario: Browse public lists paginated

- **WHEN** an authenticated user requests `GET /todo-lists/public?page=1&limit=20`
- **THEN** the system returns paginated lists with `is_public` true and `user_id` different from the JWT `sub`
- **THEN** each item in `data` includes minimal owner info (`id`, `first_name`, `last_name`)
