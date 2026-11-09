import { Collection } from 'discord.js';
import { getFiles, importFile } from './files.js';
import { logger } from './logger.js';

export class InteractionRegistry {
  #exact = new Collection();
  #patterns = [];

  add(customId, handler, file) {
    if (typeof customId === 'string') {
      if (this.#exact.has(customId)) {
        throw new Error(`Duplicate customId "${customId}" in ${file}`);
      }

      this.#exact.set(customId, handler);
      return;
    }

    if (customId instanceof RegExp) {
      this.#patterns.push({ pattern: customId, handler });
      return;
    }

    throw new Error(`Invalid customId in ${file}`);
  }

  find(customId) {
    const exact = this.#exact.get(customId);

    if (exact) {
      return exact;
    }

    for (const { pattern, handler } of this.#patterns) {
      pattern.lastIndex = 0;

      if (pattern.test(customId)) {
        return handler;
      }
    }

    return null;
  }

  get size() {
    return this.#exact.size + this.#patterns.length;
  }
}

export async function loadInteractionHandlers(directory) {
  const registry = new InteractionRegistry();
  const files = await getFiles(directory);

  for (const file of files) {
    const handler = await importFile(file);

    if (!handler?.customId || typeof handler.execute !== 'function') {
      logger.warn(`Skipping invalid interaction handler: ${file}`);
      continue;
    }

    registry.add(handler.customId, handler, file);
  }

  return registry;
}
