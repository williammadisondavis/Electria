const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

type UserRecord = {
  user_id?: unknown;
  full_name?: unknown;
  created_at?: unknown;
  account_status?: unknown;
  [key: string]: unknown;
};

export function toPublicUser(user: UserRecord) {
  const { user_id, full_name, created_at, account_status } = user;
  return { user_id, full_name, created_at, account_status };
}

export function apiNotFound(): Response {
  return Response.json({ error: "Route not found." }, { status: 404 });
}
