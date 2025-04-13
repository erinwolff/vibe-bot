# Welcome to vibe-bot, your go-to Discord Music Bot

For playing tunes and enhancing your server's vibe. This README provides a
comprehensive guide on setting up and using vibe-bot.

![vibe-bot](https://github.com/erinwolff/vibe-bot/assets/57080166/893675da-48df-485f-9b38-355779f6e565)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Feedback and Support](#feedback-and-support)

<a name="features"></a>

## Features

- 🎵 **YouTube Playback**: Play songs from YouTube via URL or text search
- 📻 **Live Radio**: Stream various radio stations directly in your server
- 📋 **Queue Management**: Add songs to queue, view, and shuffle
- 🔄 **Reliable Performance**: Auto-reconnect and error handling built-in
- ⚡ **Fast Response**: Quick command processing with slash commands

**Requirements:**

- Node.js v20.19.0
- FFmpeg (included via ffmpeg-static)
- Discord Bot Token with proper permissions

<a name="getting-started"></a>

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/vibe-bot.git
   cd vibe-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a config.json file** with the following structure:

   ```json
   {
     "token": "YOUR_BOT_TOKEN",
     "guild_id": "DISCORD_SERVER_ID",
     "client_id": "BOT_ID",
     "bot_chat_channel_id": "BOT_CHAT_CHANNEL_ID"
   }
   ```

4. **Start the bot**
   ```bash
   node index.js
   ```

<a name="commands"></a>

## Commands

`/play`

Play a song from YouTube via URL or Text Query. If there\'s a
queue, the song will be added to it for future playback.

Usage:

/play <query or URL\>

`/skip`

Skip the currently playing song. If no songs are left in the
queue, vibe-bot will leave the voice channel.

`/stop`

Stop the player, clear the queue, and disconnect vibe-bot from the
voice channel.

`/queue`

Display the songs currently in the queue.

`/shuffle`

Shuffles the songs currently in the queue.

`/radio`

Choose from an assortment of live radio stations including:

- KEXP
- Groove Salad
- Lounge
- Downtempo
- Trance
- Cyber
- Secret Agent
- Party Time

`/help`

Reveal all available slash commands for vibe-bot.

<a name="configuration"></a>

## Configuration

### Bot Permissions

The bot requires the following permissions:

- View Channels
- Send Messages
- Connect to Voice Channels
- Speak in Voice Channels
- Use Slash Commands

<a name="troubleshooting"></a>

## Troubleshooting

**Bot doesn't respond to commands**

- Ensure slash commands are registered correctly
- Check that the bot has proper permissions in your server
- Verify your Discord bot token is correct

**Audio playback issues**

- Make sure FFmpeg is properly installed
- Verify the bot has permission to join and speak in voice channels
- Check that the URL/query is valid and accessible

<a name="feedback-and-support"></a>

## Feedback and Support

If you need help, encounter a bug, or have
suggestions for additional features, please reach out!

Happy vibing with vibe-bot! 🎶✨
