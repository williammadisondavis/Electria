# Architecture decisions

These are the decisions that can be verified from the T01 brief and the
prototype currently in the repository. The original T00 ticket is not present
in this repository, so this document does not claim to record any additional
T00 outcomes.

## D1 - Application stack

- Next.js App Router with TypeScript is the application foundation.
- Prisma is the planned database ORM; schema work is intentionally deferred.
- NextAuth.js is the planned authentication solution; auth implementation is
  intentionally deferred.
- Stripe is the planned payment provider; payment implementation is
  intentionally deferred.
- Vercel is the planned deployment platform, with Git-connected preview
  deployments for pull requests.

## D12 - API conventions

- API responses use JSON, including errors.
- Unknown `/api` paths return HTTP 404 with
  `{"error":"Route not found."}`.
- UUID inputs use the UUID shape accepted by the existing prototype.
- User response objects must be explicitly projected from public fields;
  password hashes, email addresses, phone numbers, and other private fields
  must not be serialized.
