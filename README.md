# Welcome to vibe-bot, your go-to Discord Music Bot
For playing tunes and enhancing your server's vibe. This README provides a
comprehensive guide on setting up and using vibe-bot.

## Table of Contents
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [Commands](#commands)
  - [/play](#play)
  - [/skip](#skip)
  - [/stop](#stop)
  - [/queue](#queue)
  - [/help](#help)
- [Feedback and Support](#feedback-and-support)

## Dependencies
Ensure you have the following dependencies installed:
```
{
  "dependencies": {
    "@discord-player/extractor": "^4.4.6",
    "@discordjs/opus": "^0.9.0",
    "discord-player": "^6.6.7",
    "discord.js": "^14.14.1",
    "ffmpeg-static": "^5.2.0",
    "youtube-ext": "^1.1.16",
    "youtube-sr": "^4.3.10",
    "ytdl-core": "^4.11.5",
    "ytdl-core-discord": "^1.3.1"
  }
}
``` 

## Getting Started
Clone the repository. Install dependencies using npm
install. Create a config.json file with your Discord bot token.
```
{ 
"token": "YOUR_BOT_TOKEN" 
}
```
Run the bot with node yourBotFileName.js.

##Commands

```/play```

Play a song from YouTube via URL or Text Query. If there\'s a
queue, the song will be added to it for future playback.

Usage:

/play <query or URL\>

```/skip```

Skip the currently playing song. If no songs are left in the
queue, vibe-bot will leave the voice channel.

Usage:

/skip

```/stop``` 

Stop the player, clear the queue, and disconnect vibe-bot from the
voice channel.

Usage:

/stop

```/queue```

Display the songs currently in the queue.

Usage:

/queue

```/help``` 

Reveal all available slash commands for vibe-bot.

Usage:

/help

##Feedback and Support 

If you need more help, encounter a bug, or have
suggestions for additional features, please reach out!

Happy vibing with vibe-bot! 🎶✨
