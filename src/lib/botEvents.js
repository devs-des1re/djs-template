import { logger } from './logger.js';

export const BotEvents = Object.freeze({
  CommandRan: 'CommandRan',
  ErrorRaised: 'ErrorRaised',
  EventTriggered: 'EventTriggered',
  DatabaseEdited: 'DatabaseEdited',
});

export function emitBotEvent(client, event, payload) {
  try {
    client.emit(event, payload);
  } catch (error) {
    logger.error(`Bot event listener failed for ${event}.`);
    logger.error(error);
  }
}
