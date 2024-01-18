const { Player } = require('discord-player');
const { ActivityType } = require('discord.js');
const config = require('./config.json');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

async function vibeBot() {
  const client = new Discord.Client({
    intents: [
      'GuildVoiceStates', // Allows the bot to receive information about voice state updates (such as when a user joins/leaves a channel)
      'Guilds',           // Allows the bot to receive information about the guilds (servers) it is in
      'GuildMessages',    // Allows the bot to receive messages in a guild
      'MessageContent',   // Allows the bot to receive message content
    ]
  });

  const player = new Player(client);

  // Load all default extractors
  await player.extractors.loadDefault();

  // success message once client is logged in
  client.on('ready', (c) => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('vibe-bot is online and ready to rock!');

    // Set custom message and presence status
    try {
      client.user.setPresence({
        activities: [{ name: `some tunes`, type: ActivityType.Listening }], // Activity types: Competing, Custom, Listening, Playing, Streaming, Watching
        status: 'online',
      });
      console.log('Activity set successfully');
    } catch (error) {
      console.error('Error setting activity:', error);
    }
  });

  player.events.on('playerStart', (queue, track) => {
    queue.metadata.channel.send(`Now playing **${track.title}** ♫⋆｡♪ ₊˚♬ ﾟ.`);
  });

  player.events.on('audioTrackAdd', async (queue) => {
    // Check if the player is not already playing
    if (!queue.isPlaying) {
      try {
        // Check if a node exists for the guild
        if (!player.nodes.has(queue.guild.id)) {
          // If not, create one
          player.nodes.create(queue.guild.id, {});
        }
        queue.play(); // Start playback if not already playing
      } catch (error) {
        console.error('Error starting playback:', error);
        return interaction.editReply(`Something went wrong: ${e}`);
      }
    }
  });

  // Function to handle slash commands incoming from Discord (interaction)
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'play') {
      await execute(interaction);
    } else if (commandName === 'skip') {
      handleSkipCommand(interaction);
    } else if (commandName === 'stop') {
      handleStopCommand(interaction);
    } else if (commandName === 'queue') {
      handleQueueCommand(interaction);
    } else if (commandName === 'help') {
      handleHelpCommand(interaction);
    }
  });

  // Function to handle the PLAY command
  async function execute(interaction) {

    // Retrieve the query from options
    const query = interaction.options.get('query')?.value;

    // Defer the interaction as things can take time to process
    await interaction.deferReply();

    try {
      // Get the member who triggered the interaction
      const member = interaction.member;

      // Get the channel where the member is located
      const channel = member.voice.channel;

      let urlOrQuery;

      // Checks whether the query is a URL or a string to be searched on YouTube
      if (query.startsWith('http://') || query.startsWith('https://')) {
        urlOrQuery = query;
      } else {
        urlOrQuery = `ytsearch:${query}`;
      }

      // Check if the member is in a voice channel
      if (!member || !member.voice.channel) {
        return interaction.editReply('You are not connected to a voice channel!');
      }

      // Check if the query is present before calling player.play
      if (!query) {
        return interaction.editReply('Please provide a valid query!');
      }

      // Now, proceed with playing the song
      const { track } = await player.play(channel, urlOrQuery, {
        nodeOptions: {
          metadata: interaction,
        }
      });

      // Creating a buffer using ytdl for quality control
      const buffer = ytdl(url, {
        quality: 'highestaudio',
        filter: (form) => {
          if (form.bitrate && guildMember.voice.channel?.bitrate) return form.bitrate <= guildMember.voice.channel.bitrate;
          return false;
        },
      });

      // // Update the initial reply with the track title
      return interaction.editReply(`**${track.title}** added to the queue જ⁀➴ `);
    } catch (e) {
      console.error('Error:', e);
      // Return an error if something failed
      return interaction.editReply(`Something went wrong: ${e}`);
    }
  }

  // Function to handle the SKIP command
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

  // Function to handle the STOP command
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

  // Function to reveal the current QUEUE
  async function handleQueueCommand(interaction) {

    // Get the guild id from the interaction
    const guildId = interaction.guild.id;

    // Fetch the queue
    const queue = player.nodes.get(guildId);

    // Check if there's a queue
    if (!queue) {
      return interaction.reply('No songs in the queue!');
    }

    // Generate a list of tracks
    const tracks = queue.tracks.map((track, index) => {
      return `${index + 1}. ${track.title}`;
    }).join('\n');

    // Reply with the list of tracks
    interaction.reply(`Songs in the queue: \`\`\`\n${tracks}\n\`\`\``);
  }

  // Function to reveal HELP options
  async function handleHelpCommand(interaction) {
    interaction.reply(`
    \`\`\`If you need more help, run into a bug, or have suggestions for additional features, let @littlemiss know!

    /play: Play a song from YouTube (via URL or Text Query) If there's a queue, adds song to queue for future playing.
    /skip: Skip the song currently playing. If no songs are left in the queue, vibe-bot will leave the voice channel.
    /stop: Stops the player, clears the queue, and disconnects vibe-bot from the voice channel.
    /queue: Displays the songs currently in the queue.
    /help: Reveals all slash commands available for vibe-bot.\`\`\`
  `);
  }

  // Error handling 
  process.on('uncaughtException', (err) => {
    console.error('An uncaught exception occurred:', err);
    process.exit(1); // Exit the process with a failure code
  });

  client.login(config.token)
}
vibeBot();