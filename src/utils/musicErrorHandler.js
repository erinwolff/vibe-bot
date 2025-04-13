/**
 * Music error handler module
 * Centralizes error handling and error messages for music commands
 */

/**
 * Handle errors from music commands and provide appropriate user-friendly messages
 * @param {Error} error - The error that occurred
 * @param {Object} interaction - Discord interaction object for replying
 * @param {string} guildId - Guild ID where the error occurred
 * @param {Function} cleanupFunction - Function to call for resource cleanup
 * @returns {Promise<void>}
 */
async function handleMusicError(
  error,
  interaction,
  guildId,
  cleanupFunction = null
) {
  console.error(`Music command error [${guildId}]:`, error);

  try {
    // Check for common error patterns and provide specific responses
    if (
      error.message?.includes("no video id found") ||
      error.message?.includes("no matching")
    ) {
      await interaction.editReply(
        "Could not find that song. Please try a different search term or URL."
      );
    } else if (
      error.message?.includes("Sign in") ||
      error.message?.includes("private") ||
      error.message?.includes("unavailable in your country")
    ) {
      await interaction.editReply(
        "This video requires age verification, is private, or is unavailable in your region."
      );
    } else if (
      error.message?.includes("copyright") ||
      error.message?.includes("removed")
    ) {
      await interaction.editReply(
        "This song is unavailable due to copyright restrictions or has been removed."
      );
    } else if (
      error.message?.includes("network") ||
      error.message?.includes("timeout") ||
      error.message?.includes("ETIMEDOUT")
    ) {
      await interaction.editReply(
        "Network error while trying to play that song. Please try again later."
      );
    } else if (error.message?.includes("permission")) {
      await interaction.editReply(
        "I don't have permission to join that voice channel. Please check my permissions."
      );
    } else {
      // Generic error for unrecognized issues
      await interaction.editReply(
        "Failed to play that song. Please try a different song or try again later."
      );
    }
  } catch (replyError) {
    console.error(`Failed to send error reply [${guildId}]:`, replyError);
  } finally {
    // Run cleanup function if provided
    if (cleanupFunction && typeof cleanupFunction === "function") {
      try {
        await cleanupFunction(guildId);
      } catch (cleanupError) {
        console.error(`Error during cleanup [${guildId}]:`, cleanupError);
      }
    }
  }
}

/**
 * Log detailed errors with additional context
 * @param {string} commandName - Name of the command where error occurred
 * @param {Error} error - The error that occurred
 * @param {Object} context - Additional context about the error
 */
function logDetailedError(commandName, error, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  console.error(`[${timestamp}] Error in ${commandName}: ${error.message}`);
  console.error(`Context: ${contextStr}`);

  if (error.stack) {
    console.error(`Stack trace: ${error.stack}`);
  }
}

module.exports = {
  handleMusicError,
  logDetailedError,
};
