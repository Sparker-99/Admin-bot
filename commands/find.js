const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const StringTable = require('string-table')
exports.run = async (client, message, args) => {
    if (!args || args.length !== 1) return message.channel.send("Usage:```css\n" + client.config.prefix + "find <name | xuid>```");

    let query;
    if (isNaN(args[0])) query = "name=" + args[0];
    else query = "xuid=" + args[0];

    let response = await fetch(client.config.webfronturl + '/api/client/find?' + query)
        .catch(() => { console.log('\x1b[31mWarning: ' + client.config.webfronturl + ' not reachable\x1b[0m') });

    if (!response) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (response.status === 400) return message.channel.send("The length of 'Name' must be at least 3 characters");

    let data = await response.json();
    if (data.totalFoundClients === 0) return message.channel.send("No players found with provided " + (isNaN(args[0]) ? 'name' : 'xuid'));

    let arr = data.clients.map(obj => {
        return {
            Name: obj.name,
            ClientId: obj.clientId,
            XUID: obj.xuid
        }
    })

    let tableData = StringTable.create(arr);

    const fnd = new MessageEmbed()
        .setTitle('Client Search Results')
        .setColor(client.color)
        .setDescription(`\`\`\`${tableData}\`\`\``)
        .setFooter(client.footer);
    message.channel.send(fnd);
};

exports.conf = {
    aliases: ['f']
};