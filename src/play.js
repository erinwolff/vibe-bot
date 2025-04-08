const { getVoiceConnection } = require("@discordjs/voice");

// Function to handle the PLAY command

module.exports = function playCommand(player) {
  async function execute(interaction) {
    // Retrieve the query from options
    const query = interaction.options.get("query")?.value;

    // Defer the interaction as things can take time to process
    await interaction.deferReply();

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

      // if KEXP is already playing, stop it
      const voiceConnection = getVoiceConnection(channel.guild.id);
      if (voiceConnection) {
        // Destroy the existing voice connection
        voiceConnection.destroy();

        // Wait briefly to ensure the connection is fully released
        await new Promise((resolve) => setTimeout(resolve, 3500));
      }

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

      // Update the initial reply with the track title
      return interaction.editReply(
        `**${track.title}** added to the queue જ⁀➴ `
      );
    } catch (e) {
      console.error("Error:", e);
      // Return an error if something failed
      return interaction.editReply(`Something went wrong: ${e}`);
    }
  }
  return execute;
};
