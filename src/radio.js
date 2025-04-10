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
  deephouse: "https://ice5.somafm.com/beatblender-128-mp3",
  trance: "https://ice5.somafm.com/thetrip-128-mp3",
  cyber: "https://ice5.somafm.com/defcon-128-mp3",
  secretagent: "https://ice5.somafm.com/secretagent-128-mp3",
};

const radioChoices = [
  { name: "KEXP", value: "kexp" },
  { name: "Groove Salad", value: "groovesalad" },
  { name: "Lounge", value: "lounge" },
  { name: "Deep House", value: "deephouse" },
  { name: "Trance", value: "trance" },
  { name: "Cyber", value: "cyber" },
  { name: "Secret Agent", value: "secretagent" },
];

module.exports = function radioCommand() {
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

      // Connect to the voice channel
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      // Create an audio player
      const player = createAudioPlayer({
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
        if (player) {
          player.stop();
          player.removeAllListeners(); // Remove all event listeners
          player.isStopped = true;
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

        player.play(resource);
        connection.subscribe(player);

        ffmpeg.on("error", (error) => {
          console.error("FFmpeg process error:", error);
          restartStream();
        });

        ffmpeg.on("close", (code, signal) => {
          console.warn(
            `FFmpeg process exited with code ${code} and signal ${signal}`
          );
          if (!player.isStopped) {
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
        player.stop();
        startStream();
      }

      player.on("stateChange", (oldState, newState) => {
        console.log(
          `Player state changed from ${oldState.status} to ${newState.status}`
        );
        if (newState.status === "idle" && !player.isStopped) {
          console.warn("Player is idle. Restarting stream...");
          restartStream();
        }
      });

      player.on("error", (error) => {
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
