const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const { spawn } = require("child_process");

const radioStations = {
  kexp: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
  groovesalad: "https://ice5.somafm.com/groovesalad-128-mp3",
  lounge: "https://ice5.somafm.com/illstreet-128-mp3",
  downtempo: "https://ice5.somafm.com/beatblender-128-mp3",
  trance: "https://ice5.somafm.com/thetrip-128-mp3",
  cyber: "https://ice5.somafm.com/defcon-128-mp3",
  secretagent: "https://ice5.somafm.com/secretagent-128-mp3",
  partytime: "https://ice5.somafm.com/dubstep-128-mp3",
  lotradio: "https://livepeercdn.studio/hls/85c28sa2o8wppm58/index.m3u8",
};

const radioChoices = [
  { name: "KEXP", value: "kexp" },
  { name: "Groove Salad", value: "groovesalad" },
  { name: "Lounge", value: "lounge" },
  { name: "Downtempo", value: "downtempo" },
  { name: "Trance", value: "trance" },
  { name: "Cyber", value: "cyber" },
  { name: "Secret Agent", value: "secretagent" },
  { name: "Party Time", value: "partytime" },
  { name: "Lot Radio", value: "lotradio" },
];

module.exports = function radioCommand(discordPlayer) {
  async function handleRadioCommand(interaction) {
    await interaction.deferReply();
    try {
      const member = interaction.member;
      const channel = member.voice.channel;
      if (!member || !channel) {
        return interaction.editReply(
          "You are not connected to a voice channel!"
        );
      }

      // Retrieve the user-selected radio station
      const stationKey = interaction.options
        .getString("station")
        ?.toLowerCase();

      // Match the station key with the radioChoices
      const stationChoice = radioChoices.find(
        (choice) => choice.value === stationKey
      );

      // Get the station name from the choice
      const stationName = stationChoice ? stationChoice.name : null;

      const streamUrl = radioStations[stationKey];

      if (!streamUrl) {
        return interaction.editReply(
          "Invalid radio station selected. Please choose a valid option."
        );
      }

      // Check if a YouTube/discord-player queue is active in this guild
      const guildId = channel.guild.id;
      const youtubeQueue = discordPlayer.nodes.get(guildId);
      if (youtubeQueue) {
        console.log(
          "Active YouTube queue detected. Stopping it before starting Radio..."
        );
        // Stop the queue and remove it
        youtubeQueue.node.stop(guildId);
        discordPlayer.nodes.delete(guildId);
        // Wait briefly to ensure the connection is fully released
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Connect to the voice channel
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Create an audio player for the radio stream
      const radioPlayer = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play },
        isStopped: false,
      });

      connection.on("stateChange", (oldState, newState) => {
        if (newState.status === "destroyed") {
          console.warn("Voice connection destroyed. Stopping player.");
          destroyPlayer();
        }
      });

      let ffmpeg;

      function destroyPlayer() {
        console.warn("Destroying player and cleaning up resources...");
        if (ffmpeg) {
          ffmpeg.kill();
          ffmpeg = null;
        }
        if (radioPlayer) {
          radioPlayer.stop();
          radioPlayer.removeAllListeners(); // Remove all event listeners
          radioPlayer.isStopped = true;
        }
      }

      function startStream() {
        // Spawn FFmpeg with improved options
        ffmpeg = spawn("ffmpeg", [
          "-reconnect",
          "1",
          "-reconnect_streamed",
          "1",
          "-reconnect_delay_max",
          "5",
          "-fflags",
          "+nobuffer",
          "-i",
          streamUrl,
          "-vn",
          "-af",
          "volume=0.2", // Adjust FFmpeg output volume
          "-f",
          "s16le",
          "-ar",
          "48000",
          "-ac",
          "2",
          "pipe:1",
        ]);

        const resource = createAudioResource(ffmpeg.stdout, {
          inputType: StreamType.Raw,
          inlineVolume: true,
        });

        if (resource.volume) {
          resource.volume.setVolume(0.2); // 20% volume
        }

        radioPlayer.play(resource);
        connection.subscribe(radioPlayer);

        ffmpeg.on("error", (error) => {
          console.error("FFmpeg process error:", error);
          restartStream();
        });

        ffmpeg.on("close", (code, signal) => {
          console.warn(
            `FFmpeg process exited with code ${code} and signal ${signal}`
          );
          if (!radioPlayer.isStopped) {
            console.warn("FFmpeg exited unexpectedly. Restarting stream...");
            restartStream();
          } else {
            console.log("FFmpeg exited normally.");
          }
        });
      }

      function restartStream() {
        console.warn("Restarting stream...");
        if (ffmpeg) ffmpeg.kill();
        radioPlayer.stop();
        startStream();
      }

      radioPlayer.on("stateChange", (oldState, newState) => {
        console.log(
          `Player state changed from ${oldState.status} to ${newState.status}`
        );
        if (newState.status === "idle" && !radioPlayer.isStopped) {
          console.warn("Player is idle. Restarting stream...");
          restartStream();
        }
      });

      radioPlayer.on("error", (error) => {
        console.error(`Audio player error: ${error.message}`);
        restartStream();
      });

      startStream();

      return interaction.editReply(
        `**Now streaming ${stationName} Radio!** Enjoy the tunes ⋆♫˚.⋆⭒.˚⋆`
      );
    } catch (error) {
      console.error("Error in radio command:", error);

      // Return a shorter error message
      return interaction
        .editReply({
          content: "Failed to play the selected radio station.",
          ephemeral: true,
        })
        .catch((err) => {
          console.error("Failed to send error message:", err);
        });
    }
  }
  return handleRadioCommand;
};
