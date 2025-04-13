/**
 * Queue management module
 * Handles stopping current playing queue before starting radio
 */
const { getVoiceConnection } = require("@discordjs/voice");

/**
 * Stops any active player queue in a guild
 * @param {Object} discordPlayer - Discord Player instance
 * @param {string} guildId - The guild ID to check
 * @returns {Promise<boolean>} - Returns true if a queue was stopped
 */
async function stopActiveQueue(discordPlayer, guildId) {
  // Check if a YouTube/discord-player queue is active in this guild
  const youtubeQueue = discordPlayer.nodes.get(guildId);

  if (youtubeQueue) {
    console.log(
      "Active YouTube queue detected. Stopping it before starting Radio..."
    );
    // Stop the queue and remove it
    youtubeQueue.node.stop(guildId);
    discordPlayer.nodes.delete(guildId);

    // Wait briefly to ensure the connection is fully released
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }

  return false;
}

/**
 * Check for and stop any active voice connection
 * @param {string} guildId - The guild ID to check
 * @returns {boolean} - Returns true if a connection was stopped
 */
function stopActiveConnection(guildId) {
  const voiceConnection = getVoiceConnection(guildId);

  if (voiceConnection) {
    // Destroy the existing voice connection
    voiceConnection.destroy();
    return true;
  }

  return false;
}

module.exports = {
  stopActiveQueue,
  stopActiveConnection,
};
