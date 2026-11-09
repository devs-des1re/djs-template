import { Events, MessageFlags } from 'discord.js';
import { config } from '../config.js';
import { BotEvents, emitBotEvent } from '../lib/botEvents.js';
import { logger } from '../lib/logger.js';
import { resolveParams } from '../lib/params.js';
import { guardPermissions, hasPermission } from '../lib/permissions.js';

const errorMessage = config.bot.messages.error;

async function replyWithError(interaction) {
  if (interaction.isAutocomplete()) {
    await interaction.respond([]).catch(() => {});
    return;
  }

  const payload = {
    content: errorMessage,
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp(payload).catch(() => {});
  } else {
    await interaction.reply(payload).catch(() => {});
  }
}

async function runHandler(interaction, handler, label, args = []) {
  if (!(await guardPermissions(interaction, handler, label))) {
    return false;
  }

  await handler.execute(interaction.client, interaction, ...args);
  return true;
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const client = interaction.client;

    try {
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`No command found for /${interaction.commandName}`);
          await interaction.respond([]).catch(() => {});
          return;
        }

        if (typeof command.autocomplete !== 'function') {
          logger.warn(`No autocomplete handler found for /${interaction.commandName}`);
          await interaction.respond([]).catch(() => {});
          return;
        }

        if (!hasPermission(interaction, command.permissions)) {
          await interaction.respond([]).catch(() => {});
          return;
        }

        const focused = interaction.options.getFocused(true);

        await command.autocomplete(interaction.client, interaction, focused);
        return;
      }

      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`No command found for /${interaction.commandName}`);
          return;
        }

        const params = resolveParams(interaction);
        const executed = await runHandler(interaction, command, `/${interaction.commandName}`, [
          params,
        ]);

        if (executed) {
          emitBotEvent(client, BotEvents.CommandRan, { client, interaction, command, params });
        }

        return;
      }

      if (interaction.isButton()) {
        const handler = client.buttons.find(interaction.customId);

        if (!handler) {
          logger.warn(`No button handler found for "${interaction.customId}"`);
          return;
        }

        await runHandler(interaction, handler, `button "${interaction.customId}"`);
        return;
      }

      if (interaction.isAnySelectMenu()) {
        const handler = client.dropdowns.find(interaction.customId);

        if (!handler) {
          logger.warn(`No dropdown handler found for "${interaction.customId}"`);
          return;
        }

        await runHandler(interaction, handler, `dropdown "${interaction.customId}"`, [
          interaction.values,
        ]);
        return;
      }

      if (interaction.isModalSubmit()) {
        const handler = client.modals.find(interaction.customId);

        if (!handler) {
          logger.warn(`No modal handler found for "${interaction.customId}"`);
          return;
        }

        await runHandler(interaction, handler, `modal "${interaction.customId}"`, [
          interaction.fields,
        ]);
      }
    } catch (error) {
      const identifier = interaction.customId ?? interaction.commandName ?? interaction.type;

      logger.error(`Interaction handling failed for "${identifier}".`);
      logger.error(error);

      emitBotEvent(client, BotEvents.ErrorRaised, { client, interaction, error });
      await replyWithError(interaction);
    }
  },
};
