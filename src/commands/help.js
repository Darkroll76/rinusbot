const fs = require('fs');

exports.run = async function (client, msg, args) {

    if (!args[0]) {

        const commands = await fs.readdirSync('./commands/');
        let aliases  = require('../aliases.json');
        delete require.cache[require.resolve('../aliases.json')];
        aliases = Object.keys(aliases).map(a => `${a}${pad(10, a)}${aliases[a]}`).join('\n');

        msg.channel.createMessage({ embed: {
            color: config.options.embedColour,
            title: 'Help',
            description: commands.map(c => c.replace('.js', '')).sort().join(', '),
            fields: [
                { name: 'Aliases', value: `\`\`\`\n${aliases}\n\`\`\``, inline: true }
            ]
        }});

    } else {

        try {
            const cmd = require(`./${args[0]}.js`).usage;
            delete require.cache[require.resolve(`./${args[0]}.js`)];
            msg.channel.createMessage({ embed: {
                color: config.options.embedColour,
                title: `${cmd.main.replace('{command}', args[0].toLowerCase()).replace('{prefix}', config.options.prefix)} ${cmd.args}`,
                description: cmd.description
            }});
        } catch (err) {
            msg.channel.createMessage({ embed: {
                color: config.options.embedColour,
                title: 'Invalid command',
                description: 'Did you type the command correctly?'
            }});
        }

    }

};

function pad(ln, str) {
    return Array(ln - str.length).join(' ');
}

exports.usage = {
    main: '{prefix}{command}',
    args: '[command]',
    description: 'Shows commands and aliases.'
};
