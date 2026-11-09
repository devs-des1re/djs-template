import { REST, Routes } from 'discord.js';
import { loadCommands } from './src/handlers/commands.js';
import { env } from './src/lib/env.js';
import { logger } from './src/lib/logger.js';

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
const route = Routes.applicationCommands(env.DISCORD_CLIENT_ID);

try {
  const commands = await loadCommands();
  const body = [...commands.values()].map((command) => command.data.toJSON());

  logger.info('Clearing global application commands...');
  await rest.put(route, { body: [] });

  logger.info(`Registering ${body.length} global application command(s)...`);
  await rest.put(route, { body });

  logger.info('Global commands registered. They can take up to an hour to appear.');
} catch (error) {
  logger.error('Failed to deploy application commands.');
  logger.error(error);
  process.exitCode = 1;
}
