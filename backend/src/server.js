import { createApp } from './app.js';
import { createStore } from './store.js';

try {
  const port = Number(process.env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.');
  const store = createStore();
  // This first-sprint prototype runs on this computer only.
  const server = createApp(store).listen(port, '127.0.0.1', () => {
    console.log(`Electria backend: http://127.0.0.1:${port}`);
    console.log(`Data source: ${store.source}. Press Control+C to stop.`);
  });
  server.on('error', (error) => {
    console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Set PORT=4001 in backend/.env.` : 'The server could not start.');
    process.exitCode = 1;
  });
  process.on('SIGINT', () => server.close(() => process.exit(0)));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
