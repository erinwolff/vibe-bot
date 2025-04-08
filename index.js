const { Player } = require("discord-player");
const { ActivityType } = require("discord.js");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const Discord = require("discord.js");
const errorHandlers = require("./src/error.js");
const slashCommands = require("./src/slashCommands.js");
const playCommand = require("./src/play.js");
const skipCommand = require("./src/skip.js");
const stopCommand = require("./src/stop.js");
const queueCommand = require("./src/queue.js");
const helpCommand = require("./src/help.js");
const shuffleCommand = require("./src/shuffle.js");
const radioCommand = require("./src/radio.js");
const config = require("./config.json");

async function vibeBot() {
  const client = new Discord.Client({
    intents: [
      "GuildVoiceStates", // Allows the bot to receive information about voice state updates (such as when a user joins/leaves a channel)
      "Guilds", // Allows the bot to receive information about the guilds (servers) it is in
      "GuildMessages", // Allows the bot to receive messages in a guild
      "MessageContent", // Allows the bot to receive message content
    ],
  });

  const player = new Player(client);
  // const youtubeToken = config.youtube_oauthToken;

  // Load all default extractors
  player.extractors.register(YoutubeiExtractor, {
    // authentication: youtubeToken,
  });

  // success message once client is logged in
  client.on("ready", (c) => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log("vibe-bot is online and ready to rock!");

    // Set custom message and presence status
    try {
      client.user.setPresence({
        activities: [{ name: `some tunes`, type: ActivityType.Listening }], // Activity types: Competing, Custom, Listening, Playing, Streaming, Watching
        status: "online",
      });
      console.log("Activity set successfully");
    } catch (error) {
      console.error("Error setting activity:", error);
    }
  });

  player.events.on("playerStart", (queue, track) => {
    queue.metadata.channel.send(
      `Now playing **${track.title}** ♫⋆｡♪ ₊˚♬ ﾟ. \n${track.url}`
    );
  });

  player.events.on("audioTrackAdd", async (queue) => {
    // Check if the player is not already playing
    if (!queue.isPlaying) {
      try {
        // Check if a queue node exists for the guild
        if (!player.nodes.has(queue.guild.id)) {
          // If not, create one
          player.nodes.create(queue.guild.id, {});
        }
        queue.play(); // Start playback if not already playing
      } catch (error) {
        console.error("Error starting playback:", error);
        return interaction.editReply(`Something went wrong: ${e}`);
      }
    }
  });

  // Function to handle slash commands incoming from Discord (interaction)
  slashCommands(
    client,
    playCommand(player),
    skipCommand(player),
    stopCommand(player),
    queueCommand(player),
    helpCommand(),
    shuffleCommand(player),
    radioCommand(player)
  );

  // Function to handle the PLAY command
  playCommand(player);

  // Function to handle the SKIP command
  skipCommand(player);

  // Function to handle the STOP command
  stopCommand(player);

  // Function to reveal the current QUEUE
  queueCommand(player);

  // Function to reveal HELP options
  helpCommand();

  // Function to handle the RADIO command
  radioCommand(player);

  // Function to handle the SHUFFLE command
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "shuffle") {
      await interaction.deferReply();
      const loadingMessage = await interaction.followUp(
        "Shuffling the queue..."
      );

      // Call the shuffle function here
      shuffleCommand(player)(interaction);

      // Edit the loading message once the shuffle operation is complete
      loadingMessage.edit("Queue shuffled successfully!");
    }
  });

  // Error handling
  errorHandlers();

  const botToken = config.token;

  client.login(botToken);
}
vibeBot();
