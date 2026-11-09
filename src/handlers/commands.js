import { Collection } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { getFiles, importFile } from '../lib/files.js';
import { logger } from '../lib/logger.js';

const commandsDirectory = fileURLToPath(new URL('../commands', import.meta.url));

export async function loadCommands() {
  const commands = new Collection();
  const files = await getFiles(commandsDirectory);

  for (const file of files) {
    const command = await importFile(file);

    if (!command?.data || typeof command.execute !== 'function') {
      logger.warn(`Skipping invalid command: ${file}`);
      continue;
    }

    if (commands.has(command.data.name)) {
      throw new Error(`Duplicate command name "${command.data.name}" in ${file}`);
    }

    commands.set(command.data.name, command);
  }

  return commands;
}
