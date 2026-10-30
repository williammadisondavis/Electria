import { readFileSync } from 'node:fs';

const demo = JSON.parse(readFileSync(new URL('./demo-data.json', import.meta.url), 'utf8'));
const columns = {
  users: 'user_id,full_name,created_at,account_status',
  vehicle_types: 'type_id,type_name,description',
  vehicles: 'vehicle_id,owner_id,type_id,brand,model,model_year,description,condition_status,owner:users(user_id,full_name),vehicle_type:vehicle_types(type_id,type_name)',
};

export class DataError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 503;
  }
}

// Keep database access in this file so routes work the same in either mode.
export function createStore(env = process.env, fetchImpl = fetch) {
  const source = env.DATA_SOURCE || 'demo';
  if (!['demo', 'supabase'].includes(source)) {
    throw new Error('DATA_SOURCE must be demo or supabase.');
  }

  let baseUrl;
  if (source === 'supabase') {
    try {
      baseUrl = new URL(env.SUPABASE_URL);
    } catch {
      throw new Error('Set SUPABASE_URL in backend/.env to your https://PROJECT.supabase.co URL.');
    }
    if (baseUrl.protocol !== 'https:' || !baseUrl.hostname.endsWith('.supabase.co')) {
      throw new Error('SUPABASE_URL must be your HTTPS project URL ending in .supabase.co.');
    }
    if (!env.SUPABASE_SECRET_KEY?.startsWith('sb_secret_') || env.SUPABASE_SECRET_KEY.includes('REPLACE_ME')) {
      throw new Error('Set SUPABASE_SECRET_KEY in backend/.env to a server secret key from Supabase.');
    }
  }

  async function read(table, { id, typeId, limit = 100 } = {}) {
    if (!Object.hasOwn(columns, table)) throw new Error('Unsupported table.');

    if (source === 'demo') {
      let rows = structuredClone(demo[table]);
      if (table === 'vehicles') {
        rows = rows.map((vehicle) => ({
          ...vehicle,
          owner: demo.users.find((user) => user.user_id === vehicle.owner_id)
            ? { user_id: vehicle.owner_id, full_name: demo.users.find((user) => user.user_id === vehicle.owner_id).full_name }
            : null,
          vehicle_type: demo.vehicle_types.find((type) => type.type_id === vehicle.type_id) || null,
        }));
        if (id) rows = rows.filter((row) => row.vehicle_id === id);
        if (typeId) rows = rows.filter((row) => row.type_id === typeId);
      }
      const key = { users: 'user_id', vehicle_types: 'type_id', vehicles: 'vehicle_id' }[table];
      return rows.sort((a, b) => a[key].localeCompare(b[key])).slice(0, limit);
    }

    const url = new URL(`/rest/v1/${table}`, baseUrl);
    url.searchParams.set('select', columns[table]);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('order', `${{ users: 'user_id', vehicle_types: 'type_id', vehicles: 'vehicle_id' }[table]}.asc`);
    if (id) url.searchParams.set('vehicle_id', `eq.${id}`);
    if (typeId) url.searchParams.set('type_id', `eq.${typeId}`);

    let response;
    try {
      response = await fetchImpl(url, {
        headers: { apikey: env.SUPABASE_SECRET_KEY, Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new DataError('Could not reach Supabase. Check the project URL, project status, and network connection.');
    }
    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        throw new DataError('Supabase denied access. Check the secret key and table SELECT grants; see README.');
      }
      throw new DataError('Supabase could not read the table or its relationships. Check Data API, schema, and foreign keys; see README.');
    }
    let rows;
    try { rows = await response.json(); } catch { throw new DataError('Supabase returned an unreadable response.'); }
    if (!Array.isArray(rows)) throw new DataError('Supabase returned an unexpected response.');
    return rows;
  }

  return { source, read };
}
