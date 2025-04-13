/**
 * Radio stream handler module
 * Handles the creation and management of audio streams
 */
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");
const { spawn } = require("child_process");

/**
 * Create a connection to a voice channel
 * @param {Object} channel - The Discord voice channel to join
 * @returns {Object} The voice connection
 */
function createVoiceConnection(channel) {
  return joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
}

/**
 * Create a radio player with error handling and auto-restart
 * @param {string} streamUrl - The URL of the audio stream
 * @param {Object} connection - The Discord voice connection
 * @returns {Object} Object with player, start/stop methods, and cleanup functions
 */
function createRadioPlayer(streamUrl, connection) {
  // Create the audio player
  const radioPlayer = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    isStopped: false,
  });

  let ffmpeg;

  // Set up connection state change listener
  connection.on("stateChange", (oldState, newState) => {
    if (newState.status === "destroyed") {
      console.warn("Voice connection destroyed. Stopping player.");
      destroyPlayer();
    }
  });

  /**
   * Clean up resources when player is destroyed
   */
  function destroyPlayer() {
    console.warn("Destroying player and cleaning up resources...");
    if (ffmpeg) {
      ffmpeg.kill();
      ffmpeg = null;
    }
    if (radioPlayer) {
      radioPlayer.stop();
      radioPlayer.removeAllListeners();
      radioPlayer.isStopped = true;
    }
  }

  /**
   * Start streaming audio
   */
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
      "volume=0.2",
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
      resource.volume.setVolume(0.2);
    }

    radioPlayer.play(resource);
    connection.subscribe(radioPlayer);

    // Set up error handling for FFmpeg
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

  /**
   * Restart the audio stream
   */
  function restartStream() {
    console.warn("Restarting stream...");
    if (ffmpeg) ffmpeg.kill();
    radioPlayer.stop();
    startStream();
  }

  // Set up player error handling
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

  return {
    player: radioPlayer,
    start: startStream,
    destroy: destroyPlayer,
  };
}

module.exports = {
  createVoiceConnection,
  createRadioPlayer,
};
