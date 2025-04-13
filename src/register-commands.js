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
    name: "radio",
    description: "Choose from a list of radio stations to play.",
    options: [
      {
        name: "station",
        type: 3, // STRING
        description: "The radio station you want to play",
        required: true,
        choices: [
          {
            name: "KEXP 🎧",
            value: "kexp",
          },
          {
            name: "Groove Salad 🥗",
            value: "groovesalad",
          },
          {
            name: "Lounge 🛋️",
            value: "lounge",
          },
          {
            name: "Deep House 🏠",
            value: "deephouse",
          },
          {
            name: "Trance 🌀",
            value: "trance",
          },
          {
            name: "Cyber 🦾",
            value: "cyber",
          },
          {
            name: "Secret Agent 🕵️",
            value: "secretagent",
          },
          {
            name: "Party Time 🎉",
            value: "partytime",
          },
        ],
      },
    ],
  },

  // Add other commands as needed
];

// Set up REST for deploying commands
const rest = new REST({ version: "10" }).setToken(config.token);

module.exports = async function registerCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    // Register global commands
    console.log("Registering global commands...");
    await rest.put(Routes.applicationCommands(config.client_id), {
      body: commands,
    });
    console.log("Successfully registered global application commands!");

    // const registeredCommands = await rest.get(
    //   Routes.applicationCommands(config.client_id)
    // );
    // console.log("Currently registered global commands:", registeredCommands);
  } catch (error) {
    console.error("Error refreshing commands:", error);
  }
  return registerCommands;
};
