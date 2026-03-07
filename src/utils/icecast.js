import { sshRun } from "./remote.js";

/**
 * Fetches the currently playing track for a local station by reading a
 * state file written by the streaming script on the PC.
 *
 * The streaming script (trove/selections) should write the current track
 * title to ~/.config/current-<stationKey>-track before each ffmpeg call:
 *   echo "$TITLE" > "$HOME/.config/current-trove-track"
 *
 * @param {string} host - The PC hostname/IP (from config)
 * @param {string} user - The SSH username (from config)
 * @param {string} stationKey - "trove" or "selections"
 * @returns {Promise<string|null>} The current track title, or null if unavailable
 */
function formatTrackTitle(raw) {
  const pipe = raw.indexOf("|");
  if (pipe !== -1) {
    const artist = raw.slice(0, pipe).trim();
    const title = raw.slice(pipe + 1).trim();
    return artist ? `**${artist}** — ${title}` : title;
  }
  // Fallback: no pipe means old format or plain filename — just return as-is
  return raw.trim();
}

export async function getLocalNowPlaying(host, user, stationKey) {
  try {
    const raw = await sshRun(host, user, `cat ~/.config/current-${stationKey}-track`);
    return raw ? formatTrackTitle(raw) : null;
  } catch {
    return null;
  }
}
