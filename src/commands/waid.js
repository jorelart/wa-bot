export async function handleWaid({
  reply,
  chatId,
  isGroup,
}) {
  const type = isGroup
    ? 'Group'
    : 'Private';

  const message = [
    '📱 *WhatsApp Information*',
    '',
    `Type: ${type}`,
    '',
    '*JID:*',
    chatId,
  ].join('\n');

  await reply(message);
}