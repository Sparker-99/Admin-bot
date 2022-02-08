const stringtable = require('string-table');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args.length || !(args.length < 3)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    if (args[0].match(/[a-z]/i) || args[0] <= 0) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    if (args[1]) {
        if (isNaN(args[1]) || args[1] <= 0) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'players <serverid | ip:port | serial no. from status cmd> <page no.>```');
    }

    let indx;
    const id = args[0];
    let infos = await client.function.fetchinfo(client.config.webfronturl);

    if (/[0-9]+.[0-9]+.[0-9]+.[0-9]+:[0-9]{1,5}$/.test(id)) {

        indx = infos.servip.findIndex((elm) => elm === id);

        if (indx === -1) {
            let myip = await client.function.getexip(client);
            if (!myip) return message.channel.send('```css\nExternal ip fetcher is down kindly use server number, server id or internal ip```');

            let exip = await infos.servip.map(el => {
                if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(el)) return myip + ':' + el.split(":")[1];
                else return el;
            });

            indx = exip.findIndex((elem) => elem === id);
        }

        if (indx === -1) return message.channel.send('```css\nServer with provided ip not found```');

    } else if ((id.length > 9 && id.length < 22) && !/[^\w\s]/g.test(id)) {

        indx = infos.servip.findIndex((elm) => elm.replace(/[^0-9]/g, '') === id);
        if (indx === -1) return message.channel.send('```css\nServer with provided id not found```');

    } else if (infos.hostnames.length >= id) indx = id - 1;

    else return message.channel.send('```css\nNo such servers found```');

    let data = await client.function.fetchplayers(client.config.webfronturl, infos.servip[indx].replace(/[^0-9]/g, ''));
    if (data === 400) return message.channel.send("Server with provided id not found");
    if (data === 404) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");

    if (!data.playerinfo) {
        const empty = new MessageEmbed()
            .setColor(client.color)
            .setDescription("```" + data.serverinfo[1] + " is empty```")
            .setFooter({ text: "ID: " + data.serverinfo[0] })
        return message.channel.send({ embeds: [empty] });
    }

    let offset;
    let players = [];
    let max = client.config.results_perpage;
    let less = max - 1;

    pgno = Math.ceil(args[1]);
    const maxpages = Math.ceil((data.playerinfo.length / max));
    if (pgno > maxpages) { pgno = pgno - (pgno - maxpages) }
    if (!pgno || pgno <= 1) { offset = 1 } else { offset = pgno * max - less }

    for (i = (offset - 1); i <= (offset - 1) + less; i++) {
        if (data.playerinfo[i]) {
            players.push({ No: i + 1, Name: "[" + data.playerinfo[i][0] + "] " + data.playerinfo[i][1], Score: data.playerinfo[i][2], Ping: data.playerinfo[i][3] });
        }
    }

    let td = stringtable.create(players);

    const plst = new MessageEmbed()
        .setTitle(data.serverinfo[1])
        .setColor(client.color)
        .setDescription(`\`\`\`${td}\`\`\``)
        .setFooter({ text: `Page: ${Math.ceil(offset / max)}/${maxpages}` })
    message.channel.send({ embeds: [plst] });
}

exports.conf = {
    aliases: ['p', 'scoreboard'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};