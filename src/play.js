const { stopActiveConnection } = require("./radio/queueManager");
const {
  handleMusicError,
  logDetailedError,
} = require("./utils/musicErrorHandler");

// Function to handle the PLAY command
module.exports = function playCommand(player) {
  async function execute(interaction) {
    // Retrieve the query from options
    const query = interaction.options.get("query")?.value;

    // Defer the interaction as things can take time to process
    await interaction.deferReply();

    // Get guild ID early for error handling
    const guildId = interaction.guild?.id;
    if (!guildId) {
      return interaction.editReply(
        "This command can only be used in a server."
      );
    }

    try {
      // Get the member who triggered the interaction
      const member = interaction.member;

      // Get the channel where the member is located
      const channel = member.voice.channel;

      // Check if the member is in a voice channel
      if (!member || !channel) {
        return interaction.editReply(
          "You are not connected to a voice channel!"
        );
      }

      // Check if the query is present before calling player.play
      if (!query) {
        return interaction.editReply("Please provide a valid query!");
      }

      // Stop any active radio or voice connection
      const connectionStopped = stopActiveConnection(guildId);

      // If a connection was stopped, wait briefly to ensure it's fully released
      if (connectionStopped) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      try {
        // Now, proceed with playing the song
        const { track } = await player.play(channel, query, {
          nodeOptions: {
            metadata: interaction,
            leaveOnEnd: true,
            leaveOnEndCooldown: 600000,
            leaveOnEmpty: true,
            leaveOnStop: true,
            leaveOnStopCooldown: 600000,
            volume: 6,
          },
        });

        // Log successful play attempt
        console.log(`Successfully queued track: "${track.title}" [${guildId}]`);

        // Update the initial reply with the track title
        return interaction.editReply(
          `**${track.title}** added to the queue જ⁀➴ `
        );
      } catch (playError) {
        // Use our dedicated error handler for music-specific errors
        await handleMusicError(
          playError,
          interaction,
          guildId,
          // Pass cleanup function to handle any resource cleanup
          (id) => stopActiveConnection(id)
        );

        // Log detailed error information for debugging
        logDetailedError("play", playError, {
          guild: guildId,
          channel: channel.id,
          query: query,
        });
      }
    } catch (e) {
      // Handle unexpected errors that aren't directly related to playing music
      logDetailedError("play", e, { guild: guildId, query: query });

      // Try to send a meaningful error response
      try {
        return interaction.editReply(
          "An unexpected error occurred while processing your request."
        );
      } catch (replyError) {
        console.error("Failed to send error reply:", replyError);
      }
    }
  }
  return execute;
};
