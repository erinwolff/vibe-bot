const { REST, Routes } = require("discord.js");
const config = require("../config.json");

// Define your slash commands
const commands = [
  {
    name: "play",
    description: "Play a song from YouTube (via URL or Text Query)",
    options: [
      {
        name: "query",
        type: 3, // STRING
        description: "The song you want to play",
        required: true,
      },
    ],
  },
  {
    name: "skip",
    description: "Skip the currently playing song.",
  },
  {
    name: "stop",
    description:
      "Stop the player - disconnects the bot from voice channel & clears the queue.",
  },
  {
    name: "queue",
    description: "Display the songs currently in the queue.",
  },
  {
    name: "help",
    description: "Display the commands available for vibe-bot.",
  },
  {
    name: "shuffle",
    description: "Shuffles the songs currently in the queue.",
  },
  {
    name: "kexp",
    description: "Start the live KEXP radio stream.",
  },

  // Add other commands as needed
];

// Set up REST for deploying commands
const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(config.client_id, config.guild_id),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
