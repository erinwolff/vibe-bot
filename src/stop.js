const { getVoiceConnection } = require("@discordjs/voice");

// Function to handle the STOP command

module.exports = function stopCommand(player) {
  async function handleStopCommand(interaction) {
    try {
      // Defer the interaction as things can take time to process
      await interaction.deferReply();

      // Get the guild id from the interaction
      const guildId = interaction.guild.id;

      // First, check if there's a voice connection regardless of queue
      const voiceConnection = getVoiceConnection(guildId);

      // Fetch the queue
      const queue = player.nodes.get(guildId);

      // Check if the player is defined and has a queue for the guild
      if (player && queue) {
        // Stop the queue
        queue.node.stop(guildId);
        // Destroy the queue node
        player.nodes.delete(guildId);
        // Send a message to the interaction channel
        await interaction.editReply("Party's over! See ya ~");
      } else if (voiceConnection) {
        // No queue but we have a voice connection (likely radio)
        voiceConnection.destroy();
        await interaction.editReply(
          "Radio stream stopped. Party's over! See ya ~"
        );
      } else {
        // Send an error message to the interaction channel
        interaction.editReply("There is nothing playing!");
      }
    } catch (error) {
      console.error("Error in stopCommand:", error);
      // Send an error message to the interaction channel
      interaction.editReply("An error occurred while stopping the stream.");
    }
  }
  return handleStopCommand;
};
