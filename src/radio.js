const { getStationUrl, getStationName } = require("./radio/stations");
const {
  createVoiceConnection,
  createRadioPlayer,
} = require("./radio/streamHandler");
const {
  stopActiveQueue,
  stopActiveConnection,
} = require("./radio/queueManager");

module.exports = function radioCommand(discordPlayer) {
  async function handleRadioCommand(interaction) {
    await interaction.deferReply();

    try {
      // 1. Check if user is in a voice channel
      const member = interaction.member;
      const channel = member.voice.channel;
      if (!member || !channel) {
        return interaction.editReply(
          "You are not connected to a voice channel!"
        );
      }

      // 2. Get the selected station information
      const stationKey = interaction.options
        .getString("station")
        ?.toLowerCase();
      const stationName = getStationName(stationKey);
      const streamUrl = getStationUrl(stationKey);

      if (!streamUrl) {
        return interaction.editReply(
          "Invalid radio station selected. Please choose a valid option."
        );
      }

      // 3. Stop any active audio/queue in the guild
      const guildId = channel.guild.id;
      await stopActiveQueue(discordPlayer, guildId);
      stopActiveConnection(guildId);

      // 4. Create voice connection and radio player
      const connection = createVoiceConnection(channel);
      const radioStream = createRadioPlayer(streamUrl, connection);

      // 5. Start the stream
      radioStream.start();

      // 6. Send success message
      return interaction.editReply(
        `**Now streaming ${stationName} Radio!** Enjoy the tunes ⋆♫˚.⋆⭒.˚⋆`
      );
    } catch (error) {
      console.error("Error in radio command:", error);

      // Return a user-friendly error message
      return interaction
        .editReply({
          content: "Failed to play the selected radio station.",
          ephemeral: true,
        })
        .catch((err) => {
          console.error("Failed to send error message:", err);
        });
    }
  }

  return handleRadioCommand;
};
