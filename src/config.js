import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const configPath = fileURLToPath(new URL('../config.json', import.meta.url));

const config = JSON.parse(readFileSync(configPath, 'utf8'));

const requiredMessages = ['error', 'permissionDenied'];
const missingMessages = requiredMessages.filter((key) => {
  const value = config.bot?.messages?.[key];

  return typeof value !== 'string' || value.trim().length === 0;
});

if (missingMessages.length > 0) {
  const keys = missingMessages.map((key) => `bot.messages.${key}`).join(', ');

  throw new Error(`config.json is missing required values: ${keys}`);
}

export { config };
