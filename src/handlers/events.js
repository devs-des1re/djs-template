import { fileURLToPath } from 'node:url';
import { BotEvents, emitBotEvent } from '../lib/botEvents.js';
import { getFiles, importFile } from '../lib/files.js';
import { logger } from '../lib/logger.js';

const eventsDirectory = fileURLToPath(new URL('../events', import.meta.url));

export async function loadEvents(client) {
  const files = await getFiles(eventsDirectory);
  let count = 0;

  for (const file of files) {
    const event = await importFile(file);

    if (!event?.name || typeof event.execute !== 'function') {
      logger.warn(`Skipping invalid event: ${file}`);
      continue;
    }

    const listener = async (...args) => {
      if (event.name !== BotEvents.EventTriggered) {
        emitBotEvent(client, BotEvents.EventTriggered, { client, name: event.name, args });
      }

      try {
        await event.execute(...args);
      } catch (error) {
        logger.error(`Event "${event.name}" failed.`);
        logger.error(error);
        emitBotEvent(client, BotEvents.ErrorRaised, { client, name: event.name, args, error });
      }
    };

    if (event.once) {
      client.once(event.name, listener);
    } else {
      client.on(event.name, listener);
    }

    count += 1;
  }

  return count;
}
