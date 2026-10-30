import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/[...path]/route";
import { isUuid, toPublicUser } from "../lib/api-contract";

test("UUID validation accepts UUIDs and rejects malformed values", () => {
  assert.equal(isUuid("97ffdbc8-61ed-4092-a269-b8e2bb35c958"), true);
  assert.equal(isUuid("not-an-id"), false);
});

test("public user projection never returns password hashes or contact details", () => {
  const user = toPublicUser({
    user_id: "example",
    full_name: "Example User",
    password_hash: "private",
    email: "private@example.com",
    phone: "private",
  });

  assert.equal(user.full_name, "Example User");
  assert.equal("password_hash" in user, false);
  assert.equal("email" in user, false);
  assert.equal("phone" in user, false);
});

test("unknown API routes return a JSON 404", async () => {
  const response = GET();

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.deepEqual(await response.json(), { error: "Route not found." });
});
