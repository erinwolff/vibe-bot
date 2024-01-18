// Function to handle the STOP command

module.exports = function stopCommand(player){
  async function handleStopCommand(interaction) {

    // Get the guild id from the interaction
    const guildId = interaction.guild.id;

    // Fetch the queue
    const queue = player.nodes.get(guildId);

    // Check if the player is defined and has a queue for the guild
    if (player && queue) {
      // Stop the queue
      queue.node.stop(guildId);
      // Send a message to the interaction channel
      interaction.reply("Party's over! See ya ~");
    } else {
      // Send an error message to the interaction channel
      interaction.reply("There is nothing playing!");
    }
  }
  return handleStopCommand;
}
