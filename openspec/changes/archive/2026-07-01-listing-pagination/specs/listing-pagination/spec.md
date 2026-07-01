## ADDED Requirements

### Requirement: Paginated list query parameters

All collection list endpoints in this API SHALL accept optional query parameters `page` and `limit`.

- When `page` is omitted, the system MUST use `page = 1`.
- When `limit` is omitted, the system MUST use `limit = 20`.
- When `limit` is greater than `100`, the system MUST truncate `limit` to `100` without returning an error.
- When `page` or `limit` is present but not a valid integer ≥ 1, the system MUST respond with `400 Bad Request`.

#### Scenario: Default pagination

- **WHEN** a client calls a list endpoint without `page` or `limit`
- **THEN** the system uses `page = 1` and `limit = 20`

#### Scenario: Limit clamped to maximum

- **WHEN** a client calls a list endpoint with `limit=500`
- **THEN** the system applies `limit = 100` for the query and includes `limit: 100` in `meta`

#### Scenario: Invalid page

- **WHEN** a client calls a list endpoint with `page=0`
- **THEN** the system responds with `400 Bad Request`

### Requirement: Paginated list response envelope

All collection list endpoints SHALL return a JSON object with `data` (array) and `meta` (pagination metadata).

`meta` MUST include: `page`, `limit`, `total`, `total_pages`.

#### Scenario: Paginated response shape

- **WHEN** a client requests a valid paginated list
- **THEN** the response body contains `data` as an array and `meta.page`, `meta.limit`, `meta.total`, `meta.total_pages`

#### Scenario: Empty page

- **WHEN** a client requests a page beyond available data
- **THEN** the system returns `data: []` with correct `meta.total` and `meta.total_pages`

### Requirement: Users list is paginated

`GET /users` SHALL return a paginated envelope of users.

#### Scenario: List users with pagination

- **WHEN** an authenticated client requests `GET /users?page=1&limit=10`
- **THEN** the system returns at most 10 users in `data` and accurate pagination `meta`

### Requirement: Permissions list is paginated

`GET /permissions` SHALL return a paginated envelope of permissions.

#### Scenario: List permissions with pagination

- **WHEN** an authenticated client requests `GET /permissions?page=2&limit=5`
- **THEN** the system returns the second page of permissions with accurate `meta`

### Requirement: Modules list is paginated

`GET /modules` SHALL return a paginated envelope of modules.

#### Scenario: List modules with pagination

- **WHEN** an authenticated client requests `GET /modules`
- **THEN** the system returns the first page using default `page` and `limit`

### Requirement: Permission modules list is paginated

`GET /permissions/:permissionId/modules` SHALL return a paginated envelope.

#### Scenario: List permission modules with pagination

- **WHEN** an authenticated client requests `GET /permissions/{id}/modules?page=1&limit=20`
- **THEN** the system returns paginated modules linked to the permission

### Requirement: Module routes list is paginated

`GET /modules/:moduleId/routes` SHALL return a paginated envelope.

#### Scenario: List module routes with pagination

- **WHEN** an authenticated client requests `GET /modules/{id}/routes?page=1&limit=20`
- **THEN** the system returns paginated routes linked to the module
