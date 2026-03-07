import { getStationUrl, getStationName } from "./radio/stations.js";
import {
  createVoiceConnection,
  createRadioPlayer,
} from "./radio/streamHandler.js";
import { stopActiveQueue, stopActiveConnection } from "./radio/queueManager.js";
import { sshRun } from "./utils/remote.js";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

export default function radioCommand(discordPlayer) {
  async function handleRadioCommand(interaction) {
    await interaction.deferReply();

    try {
      // 1. Check if user is in a voice channel
      const member = interaction.member;
      const channel = member.voice.channel;
      if (!member || !channel) {
        return interaction.editReply(
          "You are not connected to a voice channel!",
        );
      }

      // 2. Get the selected station information
      const stationKey = interaction.options
        .getString("station")
        ?.toLowerCase();
      const stationName = getStationName(stationKey);
      let streamUrl = getStationUrl(stationKey);

      // 3. Stop any active audio/queue in the guild
      const guildId = channel.guild.id;
      await stopActiveQueue(discordPlayer, guildId);
      stopActiveConnection(guildId);

      // 3.5 Spin up local station on the PC (only for our local mount)
      const localStations = {
        selections: {
          service: "selections-radio.service",
          mount: "selections.mp3",
        },
        trove: { service: "littlemiss-trove.service", mount: "trove.mp3" },
      };

      if (stationKey in localStations) {
        const { pc_host, pc_user } = config;
        const { service, mount } = localStations[stationKey];
        await sshRun(pc_host, pc_user, `systemctl --user start ${service}`);
        await new Promise((r) => setTimeout(r, 1500));
        streamUrl = `http://${pc_host}:8000/${mount}`;
      }

      if (!streamUrl) {
        return interaction.editReply(
          "Invalid radio station selected. Please choose a valid option.",
        );
      }

      // 4. Create voice connection and radio player
      const connection = createVoiceConnection(channel);
      const radioStream = createRadioPlayer(streamUrl, connection);

      // 5. Start the stream
      radioStream.start();

      // 6. Send success message
      const label =
        stationKey === "selections"
          ? "Selections FM"
          : stationKey === "trove"
            ? "Littlemiss Treasure Trove"
            : stationName;
      return interaction.editReply(
        `**Now streaming ${label}!** Enjoy the tunes ⋆♫˚.⋆⭒.˚⋆`,
      );
    } catch (error) {
      console.error("Error in radio command:", error);

      // Return a user-friendly error message
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
}
