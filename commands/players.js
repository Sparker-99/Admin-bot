const stringtable = require('string-table');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args.length || !(args.length < 3)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    if (args[0].match(/[a-z]/i) || args[0] <= 0) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    if (args[1]) {
        if (isNaN(args[1]) || args[1] <= 0) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    }

    const id = args[0];

    if (id.length > 10 && id.length < 20) {
        var serverid = id.replace(/[^0-9]/g, '');
    } else {
        let infos = await client.function.fetchinfo(client.config.admin_id);
        if (infos[5].length >= id) {
            var serverid = infos[5][id - 1].replace(/[^0-9]/g, '');
        } else {
            return message.channel.send('```css\nServer with provided id not found```');
        }
    }

    let data = await client.function.fetchplayers(client.config.webfronturl, serverid);
    if (data === 400) return message.channel.send("Server with provided id not found");
    if (data === 404) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");

    if (!data[0]) {
        const empty = new MessageEmbed()
            .setColor(client.color)
            .setDescription("```" + data[1][1] + " is empty```")
            .setFooter("ID: " + data[1][0])
        return message.channel.send(empty);
    }

    let offset;
    let players = [];
    let max = client.config.results_perpage;
    let less = max - 1;

    pgno = Math.ceil(args[1]);
    const maxpages = Math.ceil((data[0].length / max));
    if (pgno > maxpages) { pgno = pgno - (pgno - maxpages) }
    if (!pgno || pgno <= 1) { offset = 1 } else { offset = pgno * max - less }

    for (i = (offset - 1); i <= (offset - 1) + less; i++) {
        if (data[0][i]) {
            players.push({ No: i + 1, Name: "[" + data[0][i][0] + "] " + data[0][i][1], Score: data[0][i][2], Ping: data[0][i][3] });
        }
    }

    let td = stringtable.create(players);

    const plst = new MessageEmbed()
        .setTitle(data[1][1])
        .setColor(client.color)
        .setDescription(`\`\`\`${td}\`\`\``)
        .setFooter(`Page: ${Math.ceil(offset / max)}/${maxpages}`)
    message.channel.send(plst);
}

exports.conf = {
    aliases: ['p', 'scoreboard']
};