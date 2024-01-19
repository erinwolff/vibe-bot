// Function to reveal HELP options

module.exports = function helpCommand() {
  async function handleHelpCommand(interaction) {
    interaction.reply(`
  \`\`\`If you need more help, run into a bug, or have suggestions for additional features, let @littlemiss know!

  /play: Play a song from YouTube (via URL or Text Query) If there's a queue, adds song to queue for future playing.
  /skip: Skip the song currently playing. If no songs are left in the queue, vibe-bot will leave the voice channel.
  /stop: Stops the player, clears the queue, and disconnects vibe-bot from the voice channel.
  /queue: Displays the songs currently in the queue.
  /shuffle: Shuffles the songs currently in the queue.
  /help: Reveals all slash commands available for vibe-bot.\`\`\`
`);
  }
  return handleHelpCommand;
}