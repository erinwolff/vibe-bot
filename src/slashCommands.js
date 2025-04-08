// Function to handle slash commands incoming from Discord (interaction)

module.exports = function slashCommands(
  client,
  execute,
  handleSkipCommand,
  handleStopCommand,
  handleQueueCommand,
  handleHelpCommand,
  handleShuffleCommand,
  handleRadioCommand
) {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === "play") {
      await execute(interaction);
    } else if (commandName === "skip") {
      handleSkipCommand(interaction);
    } else if (commandName === "stop") {
      handleStopCommand(interaction);
    } else if (commandName === "queue") {
      handleQueueCommand(interaction);
    } else if (commandName === "help") {
      handleHelpCommand(interaction);
    } else if (commandName === "shuffle") {
      handleShuffleCommand(interaction);
    } else if (commandName === "radio") {
      handleRadioCommand(interaction);
    }
  });
};
