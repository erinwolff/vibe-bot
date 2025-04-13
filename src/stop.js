const { stopActiveConnection } = require("./radio/queueManager");
const {
  handleMusicError,
  logDetailedError,
} = require("./utils/musicErrorHandler");

module.exports = function stopCommand(player) {
  async function execute(interaction) {
    await interaction.deferReply();

    // Get guild ID early for error handling
    const guildId = interaction.guild?.id;
    if (!guildId) {
      return interaction.editReply(
        "This command can only be used in a server."
      );
    }

    try {
      // Check for discord-player queue first
      const queue = player.nodes.get(interaction.guild);
      let stoppedSomething = false;

      if (queue) {
        try {
          // Save whether we had a queue before stopping
          stoppedSomething = true;

          // Stop the queue
          queue.delete();
        } catch (queueError) {
          // Log but continue - we'll still try to stop any active connections
          logDetailedError("stop-queue", queueError, { guild: guildId });
        }
      }

      // Also try to stop any potential radio or lingering voice connection
      const connectionStopped = stopActiveConnection(guildId);
      stoppedSomething = stoppedSomething || connectionStopped;

      if (stoppedSomething) {
        return interaction.editReply("Party's over! See ya ~");
      } else {
        return interaction.editReply("I'm not currently playing anything!");
      }
    } catch (e) {
      // Handle unexpected errors
      logDetailedError("stop", e, { guild: guildId });

      try {
        // Even if we get an error, try one last time to force disconnect
        stopActiveConnection(guildId);

        return interaction.editReply(
          "⚠️ Encountered an issue, but attempted to stop playing and disconnect."
        );
      } catch (replyError) {
        console.error("Failed to send error reply:", replyError);
      }
    }
  }

  return execute;
};
