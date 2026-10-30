import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createStore, DataError } from '../src/store.js';

async function serve(t, store = createStore({ DATA_SOURCE: 'demo' })) {
  const server = createApp(store).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  return async (path) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
    return { status: response.status, body: await response.json() };
  };
}

test('health identifies demo mode without claiming a database connection', async (t) => {
  const request = await serve(t);
  assert.equal((await request('/health')).body.data_source, 'demo');
  assert.equal((await request('/api/db-health')).body.status, 'not_connected');
});

test('user API excludes password hashes and contact details', async (t) => {
  const request = await serve(t, { source: 'supabase', read: async () => [{ user_id: 'example', full_name: 'Example User', password_hash: 'private', email: 'private@example.com', phone: 'private' }] });
  const { body } = await request('/api/users');
  assert.equal(body.data[0].full_name, 'Example User');
  for (const field of ['password_hash', 'email', 'phone']) assert.equal(field in body.data[0], false);
});

test('sample records include two users and three vehicle types', async (t) => {
  const request = await serve(t);
  assert.equal((await request('/api/users')).body.count, 2);
  assert.equal((await request('/api/vehicle-types')).body.count, 3);
});

test('vehicle list joins each of five vehicles to an owner and category', async (t) => {
  const request = await serve(t);
  const { status, body } = await request('/api/vehicles');
  assert.equal(status, 200);
  assert.equal(body.count, 5);
  for (const row of body.data) {
    assert.equal(row.owner.user_id, row.owner_id);
    assert.equal(row.vehicle_type.type_id, row.type_id);
    assert.equal(typeof row.owner.full_name, 'string');
  }
});

test('type filter returns only matching vehicles', async (t) => {
  const request = await serve(t);
  const { body: types } = await request('/api/vehicle-types');
  const type = types.data.find((row) => row.type_name === 'e-bike');
  const { body } = await request(`/api/vehicles?type_id=${type.type_id}`);
  assert.equal(body.count, 2);
  assert.ok(body.data.every((row) => row.type_id === type.type_id));
});

test('invalid or repeated type IDs are rejected', async (t) => {
  const request = await serve(t);
  assert.equal((await request('/api/vehicles?type_id=bad')).status, 400);
  assert.equal((await request('/api/vehicles?type_id=a&type_id=b')).status, 400);
});

test('a listed vehicle can be retrieved individually', async (t) => {
  const request = await serve(t);
  const { body: list } = await request('/api/vehicles');
  const id = list.data[0].vehicle_id;
  const { body, status } = await request(`/api/vehicles/${id}`);
  assert.equal(status, 200);
  assert.equal(body.data.vehicle_id, id);
});

test('missing vehicles return 404 and invalid IDs return 400', async (t) => {
  const request = await serve(t);
  assert.equal((await request('/api/vehicles/00000000-0000-4000-8000-000000000000')).status, 404);
  assert.equal((await request('/api/vehicles/not-an-id')).status, 400);
});

test('unknown endpoints return a JSON 404', async (t) => {
  const request = await serve(t);
  const result = await request('/api/missing');
  assert.equal(result.status, 404);
  assert.equal(result.body.error, 'Route not found.');
});

test('database failures return 503 rather than silently returning demo data', async (t) => {
  const request = await serve(t, { source: 'supabase', read: async () => { throw new DataError('Database unavailable.'); } });
  const { body, status } = await request('/api/vehicles');
  assert.equal(status, 503);
  assert.equal(body.error, 'Database unavailable.');
  assert.equal('data' in body, false);
  assert.equal((await request('/api/db-health')).status, 503);
});

test('Supabase requests send a server key and the correct UUID filter', async () => {
  const id = '97ffdbc8-61ed-4092-a269-b8e2bb35c958';
  let called = false;
  const store = createStore({ DATA_SOURCE: 'supabase', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test_only' }, async (url, options) => {
    called = true;
    assert.equal(url.pathname, '/rest/v1/vehicles');
    assert.equal(url.searchParams.get('type_id'), `eq.${id}`);
    assert.match(url.searchParams.get('select'), /owner:users/);
    assert.equal(options.headers.apikey, 'sb_secret_test_only');
    return new Response('[]', { status: 200 });
  });
  assert.deepEqual(await store.read('vehicles', { typeId: id }), []);
  assert.equal(called, true);
});

test('Supabase permission errors produce actionable messages without leaking keys', async () => {
  const store = createStore({ DATA_SOURCE: 'supabase', SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test_only' }, async () => new Response('{}', { status: 403 }));
  await assert.rejects(store.read('users'), (error) => error.statusCode === 503 && error.message.includes('SELECT grants') && !error.message.includes('sb_secret'));
});

test('Supabase mode requires its own valid configuration', () => {
  assert.throws(() => createStore({ DATA_SOURCE: 'supabase' }), /SUPABASE_URL/);
  assert.throws(() => createStore({ DATA_SOURCE: 'typo' }), /DATA_SOURCE/);
});
