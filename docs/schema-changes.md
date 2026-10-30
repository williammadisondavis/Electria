# Schema changes from the ERD

The Prisma model covers the ten MVP entities only. The ERD's `maintenance_log`
and `dispute` stretch entities are intentionally excluded.

## Naming and legacy compatibility

- Prisma model and property names use singular PascalCase and camelCase; SQL
  table and column names remain plural and snake_case through `@@map` and
  `@map`.
- The ERD names the category entity `VEHICLE_CATEGORY` with `category_id` and
  `name`. It remains `vehicle_types` with `type_id` and `type_name` in the
  database to preserve the existing SQL schema, CSV identifiers, and API
  references. Prisma exposes this entity as `VehicleType` and `categoryId`.
- The old three-table SQL definition is preserved as the first migration
  baseline. The following migration evolves those tables and creates the seven
  remaining MVP tables.

## Deliberate data-preserving deviations

- `users.home_city` and `users.date_of_birth` are nullable because existing
  users have no trustworthy values for either field. They can be made required
  after real values are collected.
- `vehicles.allowed_use` defaults to `both` for existing vehicles during
  migration; new application flows should explicitly collect this value.
- New users default to role `both` and `id_verified = false`; new listings
  default to `paused`; new bookings default to `requested`. Listing photos
  default to sort order `0` and `is_cover = false`.
- User roles, booking statuses, and listing statuses use PostgreSQL enums for
  consistent validation. The ERD describes these as controlled value lists.
- Review ratings have a database check requiring values from 1 through 5.
- Booking and availability intervals require `end_at > start_at`; listing
  coordinates are constrained to valid latitude/longitude ranges.
- Photos and availability blocks are deleted with their listing; messages and
  reviews are deleted with their booking. Other core relationships restrict
  deletion to preserve referenced financial and ownership records. The two
  original vehicle foreign keys are migrated to explicit `RESTRICT` deletion
  and `CASCADE` key updates.

## ERD decisions needing confirmation

The T00 record was not present in the repository. The implementation uses the
ticket's specified role and booking-status values, keeps `approved_at` nullable,
and adds nullable `pickup_area` as requested by D3/D11 references in the
ticket. `pickup_area` is `VARCHAR(120)`. Confirm these choices against T00
before the shared-database migration if its outcomes differ.

## Migration workflow

For a clean PostgreSQL database, set `DATABASE_URL` and `DIRECT_URL` in the
local `.env`, then run `npm run db:migrate`. This creates the legacy baseline
and applies the MVP schema. `migrate dev` requires a database user that can
create/use a shadow database.

If the shared Supabase database already has the three tables from
`sql/001_users_vehicle_types_vehicles.sql` and has no Prisma migration history,
back it up and verify its schema matches that SQL first. Then mark the baseline
as already applied and deploy only the additive/evolution migration:

```sh
npx prisma migrate resolve --applied 20261029000000_legacy_schema_baseline
npm run db:deploy
```

For a new, empty Supabase database, use `npm run db:deploy` without resolving
the baseline. Do not mark the baseline as applied on an empty database.

The shared Supabase migration has not been run from this workspace: no database
connection URLs were configured. Never commit real connection strings.
