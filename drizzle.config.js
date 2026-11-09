import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';

const databasePath = fileURLToPath(new URL('./data/database.db', import.meta.url));

export default defineConfig({
  dialect: 'sqlite',
  schema: './db/schema.js',
  out: './drizzle',
  dbCredentials: {
    url: databasePath,
  },
});
