import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { logger } from './logger.js';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));

dotenv.config({ path: envPath, quiet: true });

const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = Object.freeze({ ...process.env });
