// Function to handle the SHUFFLE command

module.exports = function shuffleCommand(player) {
  async function handleShuffleCommand(interaction) {
    // Get the guild id from the interaction
    const guildId = interaction.guild.id;

    // Fetch the queue
    const queue = player.nodes.get(guildId);

    // Check if the player is defined and has a queue for the guild
    if (player && queue) {
      await queue.tracks.shuffle();
    } else {
      // Throw an error message
      throw new Error("There is nothing playing!");
    }
  }
  return handleShuffleCommand;
}
