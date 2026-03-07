import { REST, Routes } from "discord.js";
import { readFileSync } from "fs";
import { getRadioChoices } from "./radio/stations.js";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

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
        choices: getRadioChoices(),
      },
    ],
  },

  {
    name: "nowplaying",
    description: "Show what is currently playing on the local radio stations.",
  },

  // Add other commands as needed
];

// Set up REST for deploying commands
const rest = new REST({ version: "10" }).setToken(config.token);

export default async function registerCommands() {
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
}