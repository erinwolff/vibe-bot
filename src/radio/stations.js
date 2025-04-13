/**
 * Radio station data module
 * Contains all available radio stations and their respective stream URLs
 */

// Mapping of station keys to their stream URLs
const radioStations = {
  kexp: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
  groovesalad: "https://ice5.somafm.com/groovesalad-128-mp3",
  lounge: "https://ice5.somafm.com/illstreet-128-mp3",
  downtempo: "https://ice5.somafm.com/beatblender-128-mp3",
  trance: "https://ice5.somafm.com/thetrip-128-mp3",
  cyber: "https://ice5.somafm.com/defcon-128-mp3",
  secretagent: "https://ice5.somafm.com/secretagent-128-mp3",
  partytime: "https://ice5.somafm.com/dubstep-128-mp3",
};

// Choice options for Discord slash command
const radioChoices = [
  { name: "KEXP 🎧", value: "kexp" },
  { name: "Groove Salad 🥗", value: "groovesalad" },
  { name: "Lounge 🛋️", value: "lounge" },
  { name: "Downtempo 🎵", value: "downtempo" },
  { name: "Trance 🌀", value: "trance" },
  { name: "Cyber 🦾", value: "cyber" },
  { name: "Secret Agent 🕵️", value: "secretagent" },
  { name: "Party Time 🎉", value: "partytime" },
];

/**
 * Get the stream URL for a specific radio station
 * @param {string} stationKey - The key of the radio station
 * @returns {string|null} The stream URL or null if not found
 */
function getStationUrl(stationKey) {
  return radioStations[stationKey] || null;
}

/**
 * Get the display name for a specific radio station
 * @param {string} stationKey - The key of the radio station
 * @returns {string|null} The station name or null if not found
 */
function getStationName(stationKey) {
  const station = radioChoices.find((choice) => choice.value === stationKey);
  return station ? station.name : null;
}

/**
 * Get all available radio choices for Discord slash commands
 * @returns {Array} Array of radio station choices
 */
function getRadioChoices() {
  return radioChoices;
}

module.exports = {
  getStationUrl,
  getStationName,
  getRadioChoices,
  radioStations,
  radioChoices,
};
