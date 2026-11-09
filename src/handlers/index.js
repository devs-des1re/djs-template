import { logger } from '../lib/logger.js';
import { loadButtons } from './buttons.js';
import { loadCommands } from './commands.js';
import { loadDropdowns } from './dropdowns.js';
import { loadEvents } from './events.js';
import { loadModals } from './modals.js';

export async function loadHandlers(client) {
  client.commands = await loadCommands();
  client.buttons = await loadButtons();
  client.dropdowns = await loadDropdowns();
  client.modals = await loadModals();

  const eventCount = await loadEvents(client);

  logger.info(
    `Loaded ${client.commands.size} commands, ${eventCount} events, ${client.buttons.size} buttons, ${client.dropdowns.size} dropdowns, ${client.modals.size} modals.`,
  );
}
