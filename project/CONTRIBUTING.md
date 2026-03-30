# Contributing

## Local setup
- `composer install`
- `npm install`
- `cp .env.example .env`
- Set PostgreSQL credentials in `.env`
- `php artisan key:generate`
- `php artisan migrate:fresh --seed`

## Quality gates
- `php artisan test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Commit standard
- Use conventional commits, for example:
  - `feat(auth): add google social login`
  - `fix(team): enforce owner uniqueness`

Git hooks run automatically:
- `pre-commit`: lint-staged
- `commit-msg`: commitlint

## Multi-tenant rules
- Always scope tenant-domain queries with `tenant_id`.
- Cross-tenant access must return `404`.
- Mutable entity updates must honor `row_version` and return `409 VERSION_CONFLICT` on stale writes.
- Important mutations must write append-only `activity_logs`.

