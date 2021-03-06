const moment = require('moment');
const { username } = require("../credentials")
const {Chunks, NoChunk} = require('../config');

function now()
{
    return moment().valueOf();
}

function ts_f()
{
    return "["+ moment().format("YYYY/MM/DD HH:mm:ss") +"] "
}

// Database helpers
function insertHandler( err, doc )
{
    if ( err ) { console.log( err ); }
}

function updateHandler( err, rows )
{
    if ( err ) { console.log( err ); }
}

const fs = require('fs');
module.exports = class Subscriptions {
    constructor( discordChannels, playersDb, killsDb, chunksDb) {
        this.discordChannels = discordChannels;
        this.playersDb = playersDb;
        this.killsDb = killsDb;
        this.chunksDb = chunksDb;
    }
    wrapper = undefined
    SetWrapper( inWrapper ) {  this.wrapper = inWrapper }
    PlayerJoined( discord, data )
    {
        
        this.playersDb.update(
            { id: data.user.id }, 
            { $set: { username: data.user.username, lastLogin: now() } },
            { upsert: true },
            updateHandler
        );
        discord.channels.get( this.discordChannels["PlayerJoined"] ).send('```' + ts_f() + data.user.username +" joined the server" + '```');
        console.log( data.user.username +" joined the server" );
    }

    PlayerLeft( discord, data )
    {
        discord.channels.get( this.discordChannels["PlayerLeft"] ).send('```' + ts_f() + data.user.username +" left the server" + '```');
        console.log( data.user.username +" left the server" );
    }

    
    PlayerMovedChunk( discord, data )
    {
        this.wrapper.send("trade atm get " + data.player.id).then(Response=>{
            this.playersDb.update(
                { id: data.player.id }, 
                { $set: { Bank: Response.Result } },
                { upsert: true },
                updateHandler,
            );
        });
        //console.log( data );
        this.playersDb.update({ id: data.player.id }, { $set: { lastChunk: data.newChunk } }, {}, updateHandler );
        this.chunksDb.insert({ ts: now(), player: data.player.id, chunk: data.newChunk }, insertHandler );
        // also update the zone history for the new chunk
        // TODO
        console.log( "Player " + data.player.username + " has moved to " + data.newChunk );

        if (data.newChunk.includes('Cave Layer')){
            discord.channels.get( this.discordChannels["Cave"] ).send('```' + ts_f() + "Player " + data.player.username +" Is at " + data.newChunk + '```');
            this.wrapper.send(`Player message '${data.player.id}' "${data.newChunk}" 3`);
        }else{
            const p = data.newChunk
            const regex = /-/gi;
            const c = p.replace(regex, '')
            const ChunkName = c.replace(' ', '')
            if(Chunks[ChunkName] === undefined){
                discord.channels.get(this.discordChannels["PlayerMovedChunk"] ).send('```' + ts_f() + "Player " + data.player.username + " has moved to " + data.newChunk + '```');
            }else{
            discord.channels.get(this.discordChannels["PlayerMovedChunk"] ).send('```' + ts_f() + "Player " + data.player.username + " has moved to " + Chunks[ChunkName].Name + " (" + data.newChunk + ")" + '```'); 
            }
        }
        const allowedPlayers = NoChunk[data.newChunk];
        const fullAccessPlayers = NoChunk["Full Access"];
        // Special restrictions apply. If player is not explicitly allowed and player does not have full access, he should be teleported.
        if (allowedPlayers != null && !allowedPlayers.includes(data.player.id) && !fullAccessPlayers.includes(data.player.id))
        {
            this.wrapper.send(`Player teleport '${data.player.id}' RespawnPoint`);
            this.wrapper.send(`Player message '${data.player.id}' "You entered restricted area" 5`);
            console.log( "Player " + data.player.username + " has entered restricted area at " + data.newChunk );
        }

    }

    PlayerKilled( discord, data )
    {
        //console.log( data );
        console.log( "player kill" );
        var sameChannel = ( this.discordChannels["PlayerKilled"] == this.discordChannels["PublicPlayerKilled"] )
        
        if ( data.killerPlayer != undefined ) 
        {
            this.killsDb.insert({ 
                ts: now(), 
                killed : data.killedPlayer.id, 
                killer: data.killerPlayer.id, 
                usedTool: data.usedTool, 
                toolWielder: data.toolWielder
            }, insertHandler );
            discord.channels.get( this.discordChannels["PlayerKilled"] ).send('```' + ts_f() + data.killerPlayer.username +" has killed "+ data.killedPlayer.username + '```');
            if (!sameChannel) discord.channels.get( this.discordChannels["PublicPlayerKilled"] ).send( '```'+ data.killerPlayer.username +" has murdered "+ data.killedPlayer.username +'```' );
        } else {
            if ( data.toolWielder )
            {
                this.killsDb.insert({ 
                    ts: now(), 
                    killed : data.killedPlayer.id, 
                    usedTool: data.usedTool, 
                    toolWielder: data.toolWielder
                }, insertHandler );
                let matches = data.toolWielder.match( /[0-9]+\s-\s([^\()]+)/ );
                let toolWielder = data.toolWielder;
                if ( matches !== null )
                {
                    toolWielder = matches[1];
                }
                discord.channels.get( this.discordChannels["PlayerKilled"] ).send('```' + ts_f() + data.killedPlayer.username +" was killed by: "+ toolWielder + '```');
                if (!sameChannel) discord.channels.get( this.discordChannels["PublicPlayerKilled"] ).send( '```'+ data.killedPlayer.username +" was killed by: "+ toolWielder +'```' );
            } else {
                this.killsDb.insert({ 
                    ts: now(), 
                    killed : data.killedPlayer.id, 
                }, insertHandler );
                discord.channels.get( this.discordChannels["PlayerKilled"] ).send('```' + ts_f() + data.killedPlayer.username +" had a happy accident" + '```');
                if (!sameChannel) discord.channels.get( this.discordChannels["PublicPlayerKilled"] ).send( '```'+ data.killedPlayer.username +" had a happy accident" +'```');
            }
        }
        
    }

    TradeDeckUsed( discord, data )
    {
        discord.channels.get( this.discordChannels["TradeDeckUsed"] ).send('```' + ts_f() + data.quantity + " " + data.itemName + " Was bought for " + data.price + " Gold Coins " + '```');
        console.log( data.quantity + " " + data.itemName + " Was bought for " + data.price + " Gold Coins " );
        //console.log(data)
    }

    ObjectKilled( discord, data )
    {
        console.log(data);
        if(data.killerPlayer){
            discord.channels.get( this.discordChannels["ObjectKilled"] ).send('```' + ts_f() + "A " + data.name +" was killed by " + data.killerPlayer.username + '```');
            console.log( "A " + data.name +" was killed by " + data.killerPlayer.username );
        }
    }

    PlayerStateChanged( discord, data )
    {
        if (data.state == 'Combat' && data.isEnter == true)
        {
            discord.channels.get( this.discordChannels["PlayerStateChanged"] ).send('```' + ts_f() + data.user.username + " Has Entered Combat" + '```');
            console.log( data.user.username + " Has Entered Combat" );
        }
        if (data.state == 'Combat' && data.isEnter == false)
        {
            discord.channels.get( this.discordChannels["PlayerStateChanged"] ).send('```' + ts_f() + data.user.username + " Has Left Combat" + '```');
            console.log( data.user.username + " Has Left Combat" );
        }
    
    }

    TrialStarted( discord, data )
    {
        var tplayers = '';
        for( var i in data.players )
        {
            tplayers += data.players[i].username + ", "
        }
        discord.channels.get( this.discordChannels["Trial"] ).send('```' + ts_f() + data.trial + " started by players " + tplayers + '```');
        console.log(data)
    }

    TrialFinished( discord, data )
    {
        var tplayers = '';
        for( var i in data.players )
        {
            tplayers += data.players[i].username + ", "
        }
        discord.channels.get( this.discordChannels["Trial"] ).send('```' + ts_f() + data.trial + " finished by players " + tplayers + '```');
        console.log(data)
    }

    // InfoLog has stats about commands and who has run them
    InfoLog( discord, data )
    {
        //console.log( "InfoLog", data )
        switch( data.logger )
        {
            case "Alta.Console.WebSocketCommandHandler":
                // Parse the command data
                let regcommand = /({.*}).*\ -\ (.*)$/
                var found = data.message.match(regcommand)
                try {
                    let commandDetails = JSON.parse( found[1] )
                    let commandStr = commandDetails.content
                    let commandUser = found[2]
                    if ( commandUser != username )
                    {if(commandUser != 'YourName'){
                        console.log( "Console command by "+ commandUser +" : "+ commandStr )
                        const InfoLogMessage = commandUser.length + commandStr.length + 36
                        //console.log(InfoLogMessage)
                        if(InfoLogMessage < 2000){
                        discord.channels.get( this.discordChannels["InfoLog"] ).send('```' + ts_f() + commandUser +" ran command: "+ commandStr + '```')   
                    } else{
                        fs.writeFile('Command.txt', ts_f() + commandUser +" ran command: "+ commandStr, function( err ) {
                            if (err) throw err;
                        });
                        discord.channels.get( this.discordChannels["InfoLog"] ).send({files: ['Command.txt']})
                    }
                        fs.appendFile('logs.txt','\r\n' + ts_f() + commandUser +" ran command: "+ commandStr, (err) => {
                            if (err) throw err;
                        });
                    }
                    if(commandUser == 'YourName'){
                        console.log( "Console command by "+ commandUser +" : "+ commandStr )
                        fs.appendFile('logs.txt','\r\n' + ts_f() + commandUser +" ran command: "+ commandStr, (err) => {
                            if (err) throw err;
                        });
                    }
                }
                } catch ( e ) {
                    console.log( "Error parsing console command: "+ e.message, data )
                }
            break;
            default:
            break;                
        }
    }
}
