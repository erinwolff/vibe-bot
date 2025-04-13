const {
  handleMusicError,
  logDetailedError,
} = require("./utils/musicErrorHandler");

module.exports = function skipCommand(player) {
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
      const queue = player.nodes.get(interaction.guild);

      if (!queue) {
        return interaction.editReply("There is nothing playing!");
      }

      // Get the current track before skipping
      const currentTrack = queue.currentTrack;
      const trackTitle = currentTrack ? currentTrack.title : "Current track";

      try {
        // Skip the current track
        await queue.node.skip();

        // Check if this was the last track in the queue
        const nextTrack = queue.currentTrack;

        if (nextTrack) {
          return interaction.editReply(
            `Skipped **${trackTitle}**! Now playing **${nextTrack.title}**`
          );
        } else {
          return interaction.editReply(
            `Skipped **${trackTitle}**! Queue is now empty.`
          );
        }
      } catch (skipError) {
        // Use our dedicated error handler
        await handleMusicError(skipError, interaction, guildId);

        // Log detailed error for debugging
        logDetailedError("skip", skipError, {
          guild: guildId,
          hasQueue: !!queue,
        });
      }
    } catch (e) {
      // Handle unexpected errors
      logDetailedError("skip", e, { guild: guildId });

      try {
        return interaction.editReply(
          "An unexpected error occurred while skipping the track."
        );
      } catch (replyError) {
        console.error("Failed to send error reply:", replyError);
      }
    }
  }

  return execute;
};
