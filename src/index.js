import { Client, GatewayIntentBits } from 'discord.js';
import { sqlite } from '../db/index.js';
import { config } from './config.js';
import { loadHandlers } from './handlers/index.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.config = config;

let shuttingDown = false;

async function shutdown(reason, exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info(`Shutting down (${reason})...`);

  await client.destroy().catch((error) => logger.error(error));

  try {
    sqlite.close();
  } catch (error) {
    logger.error(error);
  }

  process.exit(exitCode);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:');
  logger.error(reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:');
  logger.error(error);
  void shutdown('uncaughtException', 1);
});

try {
  await loadHandlers(client);
  await client.login(env.DISCORD_TOKEN);
} catch (error) {
  logger.error('Failed to start the bot.');
  logger.error(error);
  process.exitCode = 1;
}
