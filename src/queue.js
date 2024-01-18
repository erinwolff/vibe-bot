// Function to reveal the current QUEUE

module.exports = function queueCommand(player) {
  async function handleQueueCommand(interaction) {

    // Get the guild id from the interaction
    const guildId = interaction.guild.id;

    // Fetch the queue
    const queue = player.nodes.get(guildId);

    // Check if there's a queue
    if (!queue || queue.tracks.data.length === 0) {
      return interaction.reply('No songs in the queue!');
    }

    // Generate a list of tracks
    const tracks = queue.tracks.map((track, index) => {
      return `${index + 1}. ${track.title}`;
    }).join('\n');

    // Reply with the list of tracks
    interaction.reply(`Songs in the queue: \`\`\`\n${tracks}\n\`\`\``);
  }
  return handleQueueCommand;
}