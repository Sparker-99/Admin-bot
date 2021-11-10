const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (isNaN(args[0]) || args[0] < 1) return message.channel.send('```css\nKindly enter the server number from status cmd```');
    let infos = await client.function.fetchinfo(client.config.admin_id);
    if (!infos) return message.channel.send('```css\nInstance with the provided admin id is not found```');

    let sername = infos[0];
    let inp = args[0] - 1;

    if (!sername[inp]) return message.channel.send('```css\nInstance with the provided server number is not found use status to get all avaiable numbers```');
    let data = client.function.getinfo(infos[7][inp], infos[6][inp], infos[4][inp]);
    let mapdata = client.function.getmap(infos[3][inp], infos[8][inp]);

    let msg = new MessageEmbed()
        .setTitle('Serverinfo')
        .setColor(client.color)
        .setThumbnail(mapdata[1].replace(/na/g, client.thumbnail))
        .addField('Hostname', sername[inp].replace(/[0-9]+\. /g, '🔹 '), false)
        .addField('Players', infos[1][inp] + '/' + infos[2][inp], true)
        .addField('Gametype', client.function.getmode(infos[4][inp]).toString(), true)
        .addField('Map', mapdata[0], false)
        .addField('Client', data[0] + ' [[Connect](https://applauncher.herokuapp.com/redirect?url=' + data[1] + ')]', true)
        .setFooter('ID: ' + infos[5][inp], client.function.getgame(infos[8][inp])[1].replace(/ukn/g, client.thumbnail))
    message.channel.send({ embeds: [msg] });
};

exports.conf = {
    aliases: ['sinfo'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};