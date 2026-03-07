import { getLocalNowPlaying } from "./utils/icecast.js";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./config.json", "utf-8"));

const localStations = [
  { label: "Selections FM 💿", key: "selections" },
  { label: "Littlemiss Treasure Trove 🗃️", key: "trove" },
];

export default function nowPlayingCommand() {
  async function handleNowPlayingCommand(interaction) {
    await interaction.deferReply();

    const { pc_host, pc_user } = config;

    const results = await Promise.all(
      localStations.map(async ({ label, key }) => {
        const track = await getLocalNowPlaying(pc_host, pc_user, key);
        return track
          ? `**${label}** — ${track}`
          : `**${label}** — *offline*`;
      }),
    );

    return interaction.editReply(results.join("\n"));
  }

  return handleNowPlayingCommand;
}
