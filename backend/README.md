# Electria backend starter

This is a small Node.js and Express backend for the first Electria database stage. It reads users, vehicle types, and vehicles. The default demo data uses the team's sample record IDs, so everyone can start without waiting for database tables or credentials.

This adds a separate backend to the earlier Next.js API-route plan. Keep this folder as the team's chosen backend if adopting that change.

## Run

Use Node 24 or later. If Terminal shows a single `>` prompt, type `.exit` first; shell commands belong at the normal Terminal prompt.

From this `backend` folder:

```bash
npm ci
npm test
npm start
```

Open http://127.0.0.1:4000 for a built-in browser test page. Click Users, Vehicle types, or Vehicles to see JSON. Press Control+C in Terminal to stop the server. Use `npm run dev` to restart automatically when code changes.

Demo mode contains two users, three categories, and five vehicles. It is bundled fixture data; editing the repository CSVs or changing Supabase does not automatically change these fixtures. Live mode reads Supabase instead.

## Routes

| Method | Path | Result |
| --- | --- | --- |
| GET | `/health` | API status and selected data source |
| GET | `/api/db-health` | Actual database check in Supabase mode; explicitly not connected in demo mode |
| GET | `/api/users` | User IDs, names, account status, and registration times |
| GET | `/api/vehicle-types` | Vehicle categories |
| GET | `/api/vehicles` | Vehicles with owner names and category details |
| GET | `/api/vehicles?type_id=UUID` | Vehicles in a category |
| GET | `/api/vehicles/UUID` | One vehicle or a 404 |

List routes return at most 100 records. This is enough for the small demo dataset. All routes are read-only. Password hashes, email addresses, and phone numbers are excluded from the user API.

## Optional Supabase connection

Demo mode works without this step. To use the shared database later:

1. Have the schema SQL create `public.users`, `public.vehicle_types`, and `public.vehicles`. Vehicles must reference users through `owner_id` and vehicle_types through `type_id`.
2. Import users and vehicle_types before vehicles, keeping the sample UUIDs.
3. Keep the project's Data API enabled. In Supabase's Connect dialog, copy the project URL. Under project Settings > API Keys, find or create a server secret key beginning `sb_secret_`.
4. In this folder, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

5. Edit the complete `.env` file locally:

```dotenv
DATA_SOURCE=supabase
PORT=4000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=sb_secret_YOUR_PRIVATE_KEY
```

6. Because automatic exposure of new tables was disabled during project setup, run the following once in the Supabase SQL Editor after all three tables exist. This grants reads to the backend role and leaves RLS enabled:

```sql
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON TABLE public.users, public.vehicle_types, public.vehicles TO service_role;
```

7. Restart `npm start`, then open `/api/db-health`. A successful live check returns `status: "connected"` and `data_source: "supabase"`.

The secret key belongs only in this local backend's `.env`; never send it to frontend code or commit it. The supplied `.gitignore` excludes `.env` and node_modules. A publishable/anon key is not the server secret key used here.

If the API reports 503, check that the project is active, the table names and foreign keys match, the Data API is enabled, and the SELECT grants above were applied. It will not silently switch back to demo data.

## Testing

`npm test` uses Node's built-in test runner and starts temporary local HTTP servers. It checks health reporting, sample counts, owner/category joins, filtering, invalid input, missing records, sensitive-field exclusion, and Supabase error handling. Supabase responses are simulated in automated tests; passing tests do not prove a live Supabase connection. The `/api/db-health` check verifies that separately.

The included `requests.http` file is optional if you already use VS Code REST Client. No testing app is required; the browser test page is sufficient for manual checks.

## Commit and share

From the repository root, with this folder inside it:

```bash
git add backend
git commit -m "feat: add local Node backend with demo data and tests"
git push -u origin will-backend
```

This assumes you created the `will-backend` branch first. A teammate can get it with:

```bash
git clone --branch will-backend https://github.com/williammadisondavis/Electria.git Electria-Backend
cd Electria-Backend/backend
npm ci
npm start
```

For an existing clone, use `git fetch origin`, then `git switch --track origin/will-backend` if the branch has not been checked out locally. Each teammate creates their own local `.env` only if they need live database access.

## Current scope

This is a local class prototype and binds only to `127.0.0.1`. Authentication, authorization, write endpoints, listings, bookings, payments, and messages remain future tasks. Add user-level access controls before hosting it publicly.

## References

- https://expressjs.com/en/starter/installing/
- https://nodejs.org/docs/latest-v24.x/api/test.html
- https://supabase.com/docs/guides/getting-started/api-keys
