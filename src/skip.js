// Function to handle the SKIP command

module.exports = function skipCommand(player) {
  async function handleSkipCommand(interaction) {

    // Get the guild id from the interaction
    const guildId = interaction.guild.id;

    // Fetch the queue
    const queue = player.nodes.get(guildId);

    // Check if the player is defined and has a queue for the guild
    if (player && queue) {
      // Skip and move onto next song in the queue
      queue.node.skip(guildId);
      // Send a message to the interaction channel
      interaction.reply("Skipping current song...");
    } else {
      // Send an error message to the interaction channel
      interaction.reply("There is nothing playing!");
    }
  }
  return handleSkipCommand;
}
