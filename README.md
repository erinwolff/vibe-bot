# Welcome to vibe-bot, your go-to Discord Music Bot
For playing tunes and enhancing your server's vibe. This README provides a
comprehensive guide on setting up and using vibe-bot.

## Table of Contents
- [Dependencies](#dependencies)
- [Getting Started](#getting-started)
- [Commands](#commands)
- [Feedback and Support](#feedback-and-support)

<a name="dependencies"></a>
## Dependencies 
Ensure you have the following dependencies installed:
```
{
  "dependencies": {  
    "@discord-player/extractor": "^4.4.6",
    "@discordjs/opus": "^0.9.0",
    "@discordjs/voice": "^0.16.1",
    "discord-player": "^6.6.7",
    "discord.js": "^14.14.1",
    "ffmpeg-static": "^5.2.0",
    "ytdl-core": "^4.11.5",
    "ytdl-core-discord": "^1.3.1"
  }
}
``` 
<a name="getting-started"></a>
## Getting Started
Clone the repository. Install dependencies using npm
install. Create a config.json file with your Discord bot token, the Discord server's ID, your bot's ID, and the bot chat channel ID.
```
{ 
"token": "YOUR_BOT_TOKEN",
"guild_id":"DISCORD_SERVER_ID",
"client_id":"BOT_ID",
"bot_chat_channel_id":"BOT_CHAT_CHANNEL_ID" 
}
```
Run the bot with node yourBotFileName.js.

<a name="commands"></a>
## Commands

```/play```

Play a song from YouTube via URL or Text Query. If there\'s a
queue, the song will be added to it for future playback.

Usage:

/play <query or URL\>


```/skip```

Skip the currently playing song. If no songs are left in the
queue, vibe-bot will leave the voice channel.


```/stop``` 

Stop the player, clear the queue, and disconnect vibe-bot from the
voice channel.


```/queue```

Display the songs currently in the queue.


```/shuffle```

Shuffles the songs currently in the queue.


```/help``` 

Reveal all available slash commands for vibe-bot.


<a name="feedback-and-support"></a>
## Feedback and Support 

If you need help, encounter a bug, or have
suggestions for additional features, please reach out!

Happy vibing with vibe-bot! 🎶✨
