const ytutil           = require('../../util/youtubeHandler.js');
const scutil           = require('../../util/soundcloudHandler.js');
const sthandle         = require('../streamHandler.js');
const messageCollector = require('../../util/messageCollector.js');

const ytrx = new RegExp('(?:youtube\\.com.*(?:\\?|&)(?:v|list)=|youtube\\.com.*embed\\/|youtube\\.com.*v\\/|youtu\\.be\\/)((?!videoseries)[a-zA-Z0-9_-]*)');
const scrx = new RegExp('((https:\\/\\/)|(http:\\/\\/)|(www.)|(s))+(soundcloud.com\\/)+[a-zA-Z0-9-.]+(\\/)+[a-zA-Z0-9-.]+');

exports.run = async function (client, msg, args) {
    if (!args[0]) return msg.channel.createMessage({ embed: {
        color: config.options.embedColour,
        title: 'Volume truc',
        description: '*You\'re such a noob*'
    }});

    if (!client.voiceConnections.isConnected(msg.channel.guild.id)) {
        if (!msg.member.voiceState.channelID)
            return msg.channel.createMessage({ embed: {
                color: config.options.embedColour,
                title: 'Are you trying to troll people ? You\'re such a bastard ! :middle_finger:',
                description: '*If you want to put the volume to 9999 % you have to be with your BFF before* !'
            }});

        if (!client.voiceConnections.isConnected(msg.channel.guild.id)) return;

    }
        if (!client.voiceConnections.get(msg.channel.guild.id) || guilds[msg.channel.guild.id].queue.length === 0) return msg.channel.createMessage({ embed: {
            color: config.options.embedColour,
            title: 'There\'s no playback activity.'
        }});

        const query = args.join(' ').replace(/<|>/g, '');
        console.log(query);

        const volume = parseInt(query)/100;
        console.log(volume);

        return msg.channel.createMessage({ embed: {
            color: config.options.embedColour,
            title: 'Volume',
            description: `:speaker: ${query} %`
        }});

        client.voiceConnections.get(msg.channel.guild.id).setVolume(volume);  
};

exports.usage = {
    main: '{prefix}{command}',
    args: '',
    description: 'Change volume'
};
