import { MessageFlags } from 'discord.js';
import { config } from '../config.js';
import { logger } from './logger.js';

const permissionDeniedMessage = config.bot.messages.permissionDenied;

function toRoleIds(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getMemberRoleIds(interaction) {
  const roles = interaction.member?.roles;

  if (!roles) {
    return null;
  }

  if (Array.isArray(roles)) {
    return new Set(roles);
  }

  if (roles.cache) {
    return new Set(roles.cache.keys());
  }

  return null;
}

export function hasPermission(interaction, permissions) {
  if (!permissions) {
    return true;
  }

  const allowedRoles = toRoleIds(permissions.allowedRole);
  const restrictedRoles = toRoleIds(permissions.restrictedRole);

  if (allowedRoles.length === 0 && restrictedRoles.length === 0) {
    return true;
  }

  const memberRoleIds = getMemberRoleIds(interaction);

  if (!memberRoleIds) {
    return allowedRoles.length === 0;
  }

  if (restrictedRoles.some((roleId) => memberRoleIds.has(roleId))) {
    return false;
  }

  if (allowedRoles.length > 0) {
    return allowedRoles.some((roleId) => memberRoleIds.has(roleId));
  }

  return true;
}

async function replyWithPermissionDenied(interaction) {
  const payload = {
    content: permissionDeniedMessage,
    flags: MessageFlags.Ephemeral,
  };

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp(payload).catch(() => {});
  } else {
    await interaction.reply(payload).catch(() => {});
  }
}

export async function guardPermissions(interaction, handler, label) {
  if (hasPermission(interaction, handler.permissions)) {
    return true;
  }

  const user = `${interaction.user.tag} (${interaction.user.id})`;

  logger.warn(`Permission denied for ${user} on ${label}.`);
  await replyWithPermissionDenied(interaction);

  return false;
}
