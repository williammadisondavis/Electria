# Electria

Next.js App Router and TypeScript application foundation for Electria.

## Setup

1. Install Node.js 24 or newer.
2. Clone the repository and enter its root directory.
3. Install dependencies with `npm ci`.
4. Copy `.env.example` to `.env` if you need local integrations.
5. To work with the database, set `DATABASE_URL` and `DIRECT_URL` to your
   PostgreSQL connection strings.
6. Create/update the database from committed migrations with `npm run db:migrate`.
7. Start the development server with `npm run dev`.
8. Open [http://localhost:3000](http://localhost:3000).

## Repository structure

- `app/` - App Router pages, layouts, and API route handlers.
- `components/` - Shared UI components.
- `lib/` - Shared application logic and API conventions.
- `prisma/` - Prisma files; schema work is deferred to its dedicated ticket.
- `docs/` - Setup, decisions, and design documentation.
- `test/` - Contract tests.
- `legacy/` - Preserved Express prototype.

See [docs/design/](./docs/design/) for the status of the source design
documents and [docs/decisions.md](./docs/decisions.md) for recorded decisions.

## Scripts

| Script                 | Purpose                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run dev`          | Start Next.js in development mode.                                        |
| `npm run build`        | Create a production build.                                                |
| `npm start`            | Serve the production build.                                               |
| `npm run lint`         | Run ESLint.                                                               |
| `npm run typecheck`    | Run the TypeScript compiler without emitting files.                       |
| `npm test`             | Run API contract tests.                                                   |
| `npm run format`       | Format application, test, and scaffold documentation files with Prettier. |
| `npm run format:check` | Verify formatting.                                                        |
| `npm run db:validate`  | Validate the Prisma schema.                                               |
| `npm run db:generate`  | Generate the Prisma Client.                                               |
| `npm run db:migrate`   | Apply/create migrations in development.                                   |
| `npm run db:deploy`    | Apply committed migrations in deployment environments.                    |
| `npm run db:status`    | Check migration status.                                                   |

Database schema decisions and existing-database migration instructions are in
[docs/schema-changes.md](./docs/schema-changes.md).

## Branching and pull requests

Create a feature branch from `main`, push it, and open a pull request. Each PR
requires one review and passing CI before it is merged. The CI workflow runs
lint, type checks, tests, and a production build.

Connect this GitHub repository to Vercel and enable deployments for pull
requests in the Vercel project's Git settings. Vercel then creates a preview
deployment for each PR; production deployments use the configured production
branch.

## Definition of Done

- Changes are merged to `main` through a PR with one approval and passing CI.
- The ticket's acceptance criteria and listed manual scenarios are verified.
- New logic and permission checks have tests.
- No secrets or `.env` files are committed; API responses expose no password
  hashes or contact details.
- UI changes work in current Chrome, Safari, and Firefox.
- Any deviation from the wireframes or ERD is documented in the PR.
- The reviewer checks off the ticket's acceptance criteria before completion.
