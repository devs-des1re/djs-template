import { ApplicationCommandOptionType } from 'discord.js';

function collectOptions(options, collected = []) {
  for (const option of options ?? []) {
    if (
      option.type === ApplicationCommandOptionType.Subcommand ||
      option.type === ApplicationCommandOptionType.SubcommandGroup
    ) {
      collectOptions(option.options, collected);
      continue;
    }

    collected.push(option);
  }

  return collected;
}

function resolveValue(options, option) {
  switch (option.type) {
    case ApplicationCommandOptionType.String:
      return options.getString(option.name);
    case ApplicationCommandOptionType.Integer:
      return options.getInteger(option.name);
    case ApplicationCommandOptionType.Number:
      return options.getNumber(option.name);
    case ApplicationCommandOptionType.Boolean:
      return options.getBoolean(option.name);
    case ApplicationCommandOptionType.User:
      return options.getUser(option.name);
    case ApplicationCommandOptionType.Channel:
      return options.getChannel(option.name);
    case ApplicationCommandOptionType.Role:
      return options.getRole(option.name);
    case ApplicationCommandOptionType.Mentionable:
      return options.getMentionable(option.name);
    case ApplicationCommandOptionType.Attachment:
      return options.getAttachment(option.name);
    default:
      return option.value;
  }
}

export function resolveParams(interaction) {
  const params = {};

  for (const option of collectOptions(interaction.options.data)) {
    params[option.name] = resolveValue(interaction.options, option);
  }

  const subcommandGroup = interaction.options.getSubcommandGroup(false);
  const subcommand = interaction.options.getSubcommand(false);

  if (subcommandGroup) {
    params.subcommandGroup = subcommandGroup;
  }

  if (subcommand) {
    params.subcommand = subcommand;
  }

  return params;
}
