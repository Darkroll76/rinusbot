global.config       = require('./config.json');

const extras    = require('../util/extras.js');
const collector = require('../util/messageCollector.js');
const Eris      = require('../util/extensionLoader.js')(require('eris'));
const Discord = require('discord.js');

const clientDiscord = new Discord.Client();

const client = new Eris.Client(config.keys.discord, {
    disableEvents: extras.disable('GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'MESSAGE_DELETE', 'MESSAGE_DELETE_BULK', 'MESSAGE_UPDATE', 'PRESENCE_UPDATE', 'TYPING_START', 'USER_UPDATE'),
    messageLimit: 0,
    maxShards: 'auto',
    opusOnly: true
});

client.messageCollector = new collector(client);

Object.defineProperty(Eris.TextChannel.prototype, 'awaitMessages', {
    async value(predicate, options = {}) {
        return await client.messageCollector.awaitMessages(predicate, options, this.id);
    }
});

global.guilds = {};

client.on('ready', async () => {
    console.log(`[RinusBot] Ready! (User: ${client.user.username})`);
    client.editStatus('online', { name: `${config.options.prefix}help` });

    client.guilds.forEach(g => {
        if (!guilds[g.id])
            guilds[g.id] = { id: g.id, msgc: '', queue: [], svotes: [], repeat: 'None' };
    });
});

client.on('guildCreate', async (g) => {
    if (g.members.filter(m => m.bot).length / g.members.size >= 0.60)
        return g.leave();

    guilds[g.id] = { id: g.id, msgc: '', queue: [], svotes: [], repeat: 'None' };
});

client.on('guildDelete', async (g) => {
    delete guilds[g.id];
});

const https = require('https');

function getRequestJson(options, callback) {
    const req = https.get(options, (res) => {
        data = "";
        res.on('data', (chunk) => {
            data = data + chunk;
        })

        res.on('end', () => {
            callback(JSON.parse(data));
        })
    })

    req.on('error', (e) => {
        console.log("Request Error");
    })

    req.end();
}

function postSmugAnimeFace(cmd) {
    const options = {
        "host": "api.imgur.com",
        "path": "/3/gallery/t/memes/top/day/1?showViral=true&mature=true&album_previews=false",
        "headers": {"Authorization" : "Client-ID d77c329c8edf0f3"}
    }

    cmd.delete().catch(console.log);

    getRequestJson(options, (response) => {
        var items = response.data.items;
        while(images == null){
            randItems = Math.floor(Math.random() * items.length);
            var images = items[randItems].images;
        }

        randImages = Math.floor(Math.random() * images.length);

        url = items[randItems].images[randImages].link;
        
        cmd.channel.send({embed: {
            title: "Thanks **" + cmd.author.username + "** for this random mémé !",
            color: config.options.embedColour,
            image: {
              url: url
            }
          }});
    });
}

clientDiscord.on("message", function(message) {
    if (message.content === '$meme'){
        postSmugAnimeFace(message);
    }

    if (message.content === '$bananen'){
            var voiceChannel = message.member.voiceChannel;
            if(voiceChannel){
                message.channel.send({ embed: {
                    color: config.options.embedColour,
                    title: 'BANNNNAAAANNNEEENNNN!'
                }});
                voiceChannel.leave();
                voiceChannel.join().then(connection =>{
                    const dispatcher = connection.playFile(';/BANANEN.mp3');
                    dispatcher.on("end", end => {voiceChannel.leave();});
                }).catch(err => console.log(err));
            } else {
                message.channel.send({ embed: {
                    color: config.options.embedColour,
                    title: 'I even don\'t know where I should say BANANEN fucking idiot !'
                }});
                console.log("error");
            }
           
    }

    if (message.content === '$ah'){
        var voiceChannel = message.member.voiceChannel;
        if(voiceChannel){
            message.channel.send({ embed: {
                color: config.options.embedColour,
                title: 'AAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHHHHHHH!'
            }});
            voiceChannel.leave();
            voiceChannel.join().then(connection =>{    
                const dispatcher = connection.playFile('./AHHHHH.mp3');
                dispatcher.on("end", end => {voiceChannel.leave();});
            }).catch(err => console.log(err));
        } else {
            message.channel.send({ embed: {
                color: config.options.embedColour,
                title: 'Fucking idiot !'
            }});
            console.log("error");
        }
       
}
  });

clientDiscord.login(global.config.keys.discord);

client.on('messageCreate', async (msg) => {

    if (msg.content.toLowerCase() === 'hey rinus !' || msg.content.toLowerCase() === 'hi rinus !' || msg.content.toLowerCase() === 'hi rinus' || msg.content.toLowerCase() === 'hey rinus' || msg.content.toLowerCase() === 'rinus'){
        msg.channel.createMessage({ embed: {
            color: config.options.yellow,
            title: `:banana::banana: BANANEN ${msg.author.username.toUpperCase()} !! :banana::banana:`,
        }});
    }

    

    if (msg.isFromDM || msg.author.bot || !guilds[msg.channel.guild.id] || (msg.member && msg.member.isBlocked)) return;

    if (msg.mentions.find(m => m.id === client.user.id) && msg.content.toLowerCase().includes('help'))
        return msg.channel.createMessage({ embed: {
            color: config.options.embedColour,
            title: `Use ${config.options.prefix}help for commands`
        }});

    if (!msg.content.startsWith(config.options.prefix) || !msg.channel.hasPermissions(client.user.id, 'sendMessages', 'embedLinks')) return;

    let command = msg.content.slice(config.options.prefix.length).toLowerCase().split(' ')[0];
    const args  = msg.content.split(' ').slice(1);
    console.log(`${msg.author.username} > ${msg.content}`);

    delete require.cache[require.resolve('./aliases.json')];
    const aliases = require('./aliases.json');
    if (aliases[command]) command = aliases[command];

    try {
        delete require.cache[require.resolve(`./commands/${command}`)];
        require(`./commands/${command}`).run(client, msg, args);
    } catch(e) {
        if (e.message.includes('Cannot find module') || e.message.includes('ENOENT')) return;
        msg.channel.createMessage({ embed: {
            color: config.options.embedColour,
            title: `${command} failed`,
            description: 'The command failed to run. The error has been logged.'
        }});
        console.error(`[ERROR] ${e.message}\n${e.stack.split('\n')[0]}\n${e.stack.split('\n')[1]}`);
    }
});

client.connect();