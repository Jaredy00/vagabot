# vagabot
A Township Tale NodeJS bot

This is a simple bot building on the att-discord-tracker example by Joel VDV, aka Narmdo, aka King of ATT Meta:

https://github.com/Narmdo/att-discord-tracker

Using libraries provided by Alta VR:

- ATT Websocket bot: https://github.com/alta-vr/ATT-Bot-JS

- ATT websocket connection library: https://github.com/alta-vr/att-websockets

- Alta VR jsapi: https://github.com/alta-vr/alta-jsapi


### Usage

To start, install node/npm by following the excellent guide prepared by Joel here:

https://paper.dropbox.com/doc/An-Introduction-to-ATT-Bots-sN2e61qvfnQ3yb7uoGbL5

In short,
1. Install node/npm using the many methods available online.
2. Install dependencies with `npm i`


- **credentials.json** - this file contains the authentication information to connect to Alta API and to Discord
```
{
    "username": "ATT Username here",
    "password": "ATT Password here",
    "botToken": "Discord Bot Token here"
}
```

- **config.json** - the channel destinations for various notifications
```
{
    "targetServer" : "Server ID here",

    "discordPrefix" : "!",

    "discordChannels" :
    {
        "InfoLog" : "Channel ID Here",
        "PlayerJoined" : "Channel ID Here",
        "PlayerLeft" : "Channel ID Here",
        "PlayerKilled" : "Channel ID Here",
        "PublicPlayerKilled" : "Channel ID Here",
        "PlayerMovedChunk" : "Channel ID Here",
        "TradeDeckUsed" : "Channel ID Here",
        "CreatureKilled" : "Channel ID Here",
        "PlayerStateChanged" : "Channel ID Here",
        "UnauthorizedAccess" : "Channel ID Here",
        "Cave" : "Channel ID Here"
    },

    "discordRoles" :
    {
        "admin" : [ "Role ID Here", "2nd Role ID Here" ]
    }
}
```
- **PlayerConfig.json** - contains the list of A Township Tale servers to join, and the channel destinations for various notifications
```
{
"Full Access": ["Player ID here","2nd Player ID here"],

"Comment":[],
"Chunk ##-##": ["Player ID here","2nd Player ID here"],
"Chunk ##-##": ["Player ID here","2nd Player ID here"]
}

Example
{
"Full Access": ["3456536765","8765456543"],

"Blacksmith Guild":[],
"Chunk 12-23": ["92412642412","21412532521"]
"Chunk 12-24": ["92412642412","21412532521"]
}
```

``` 
IMPORTANT NOTE: 
The Discord IDs used in config.json should be quoted (eg. "12345" not 12345 ), they are strings not integers.
```

Once configured, start the bot going with by running the start.bat file or run the following command:

`npm start`


The bot spits a lot of data into the console currently.  If you wish to capture this for later perusal, and you're using linux (why wouldn't you be?!), for now you can pipe the poutput to a logfile:

`npm start 2>&1 >> vagabot.log`

## Enjoy!

