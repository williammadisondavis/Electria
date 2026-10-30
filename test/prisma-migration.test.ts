import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync(
  new URL("../prisma/schema.prisma", import.meta.url),
  "utf8",
);
const baseline = readFileSync(
  new URL(
    "../prisma/migrations/20261029000000_legacy_schema_baseline/migration.sql",
    import.meta.url,
  ),
  "utf8",
);
const migration = readFileSync(
  new URL(
    "../prisma/migrations/20261029000100_mvp_schema/migration.sql",
    import.meta.url,
  ),
  "utf8",
);

test("Prisma schema contains the ten MVP models and excludes stretch entities", () => {
  const models = [...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map(
    ([, name]) => name,
  );

  assert.deepEqual(models, [
    "User",
    "VehicleType",
    "Vehicle",
    "Listing",
    "ListingPhoto",
    "AvailabilityBlock",
    "Booking",
    "Payment",
    "Message",
    "Review",
  ]);
  assert.doesNotMatch(schema, /model\s+(MaintenanceLog|Dispute)\s*\{/);
  assert.match(schema, /phone\s+String\?\s+@db\.VarChar\(30\)/);
  assert.match(schema, /homeCity\s+String\?/);
  assert.match(schema, /dateOfBirth\s+DateTime\?/);
  assert.match(schema, /allowedUse\s+String/);
  assert.match(
    schema,
    /enum BookingStatus\s*\{\s*requested\s+confirmed\s+completed\s+cancelled/,
  );
});

test("MVP migration includes the required constraints and query indexes", () => {
  for (const table of [
    "listings",
    "listing_photos",
    "availability_blocks",
    "bookings",
    "payments",
    "messages",
    "reviews",
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE "${table}"`));
  }

  assert.match(migration, /"listings_vehicle_id_key"/);
  assert.match(migration, /"payments_stripe_payment_id_key"/);
  assert.match(migration, /"reviews_booking_id_reviewer_id_key"/);
  assert.match(migration, /"listings_listing_status_pickup_city_idx"/);
  assert.match(migration, /"bookings_listing_start_end_idx"/);
  assert.match(baseline, /vehicles_type_id_idx/);
  assert.match(migration, /"approved_at" TIMESTAMPTZ\(6\)/);
  assert.match(migration, /"pickup_area" VARCHAR\(120\)/);
  assert.match(migration, /"daily_rate_at_booking" DECIMAL\(10,2\)/);
});
