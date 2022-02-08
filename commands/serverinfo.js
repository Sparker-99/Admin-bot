const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (isNaN(args[0]) || args[0] < 1) return message.channel.send('```css\nKindly enter the server number from status cmd```');
    let infos = await client.function.fetchinfo(client.config.webfronturl);
    if (!infos) return message.channel.send('```css\nInstance not reachable```');

    let sername = infos.hostnames;
    let inp = args[0] - 1;

    if (!sername[inp]) return message.channel.send('```css\nInstance with the provided server number is not found use status to get all avaiable numbers```');
    let data = client.function.getinfo(infos.gameparser[inp], infos.servip[inp], infos.gametype[inp]);
    let mapdata = client.function.getmap(infos.gamemap[inp], infos.gamename[inp]);

    if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(data[1].split("//")[1]))
        data[1] = data[1].split("//")[0] + '//' + await client.function.getexip(client) + ':' + data[1].split(":").pop();

    let msg = new MessageEmbed()
        .setTitle('Serverinfo')
        .setColor(client.color)
        .setThumbnail(mapdata[1].replace(/na/g, client.thumbnail))
        .addField('Hostname', sername[inp].replace(/[0-9]+\. /g, '🔹 '), false)
        .addField('Players', infos.players[inp] + '/' + infos.maxplayers[inp], true)
        .addField('Gametype', client.function.getmode(infos.gametype[inp]).toString(), true)
        .addField('Map', mapdata[0], false)
        .addField('Client', data[0] + ' [[Connect](https://applauncher.herokuapp.com/redirect?url=' + data[1] + ')]', true)
        .setFooter({ text: 'ID: ' + infos.servip[inp].replace(/[^0-9]/g, ''), iconURL: client.function.getgame(infos.gamename[inp])[1].replace(/ukn/g, client.thumbnail) })
    message.channel.send({ embeds: [msg] });
};

exports.conf = {
    aliases: ['sinfo'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};