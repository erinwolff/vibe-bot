const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const { spawn } = require("child_process");

module.exports = function kexpCommand() {
  async function handleKEXPCommand(interaction) {
    await interaction.deferReply();
    try {
      const member = interaction.member;
      const channel = member.voice.channel;
      if (!member || !channel) {
        return interaction.editReply(
          "You are not connected to a voice channel!"
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
      });

      connection.on("stateChange", (oldState, newState) => {
        if (newState.status === "destroyed") {
          player.stop();
          ffmpeg.kill();
        }
      });

      const streamUrl = "https://kexp-mp3-128.streamguys1.com/kexp128.mp3";

      // Spawn FFmpeg with improved options
      const ffmpeg = spawn("ffmpeg", [
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
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "2",
        "pipe:1",
      ]);

      // Create an audio resource from FFmpeg's output
      const resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
        inlineVolume: true,
      });

      // Set volume to 60%
      if (resource.volume) {
        resource.volume.setVolume(0.6);
      }

      // Start playback
      player.play(resource);
      connection.subscribe(player);

      player.on("error", (error) => {
        console.error(`Audio player error: ${error.message}`);
      });

      return interaction.editReply(
        "**Now streaming KEXP Radio live!** Enjoy the tunes ⋆♫˚.⋆⭒.˚⋆"
      );
    } catch (error) {
      console.error("Error in KEXP command:", error);

      // Return a shorter error message
      return interaction
        .editReply({
          content:
            "Failed to play KEXP radio. Please check the console for more details.",
          ephemeral: true,
        })
        .catch((err) => {
          console.error("Failed to send error message:", err);
        });
    }
  }
  return handleKEXPCommand;
};
