const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (args[0] && isNaN(args[0])) return message.channel.send('```css\nFormat:\nStatus <page number>```');
    let infos = await client.function.fetchinfo(client.config.admin_id);
    if (!infos) return message.channel.send('```css\nInstance with the provided admin id is not found```');

    let offset;
    let hostembed = [];
    let converted = [];
    let mapalias = [];
    let sername = infos[0];
    let onlineplayers = infos[1];
    let totalplayers = infos[2];
    let mapcode = infos[3];
    let max = client.config.results_perpage;
    let less = max - 1;

    args[0] = Math.ceil(args[0]);
    const maxpages = Math.ceil((totalplayers.length / max));
    if (args[0] > maxpages) { args[0] = args[0] - (args[0] - maxpages) }
    if (!args[0] || args[0] <= 1) { offset = 1 } else { offset = args[0] * max - less }

    for (i = (offset - 1); i <= (offset - 1) + less; i++) {
        if (sername[i]) {
            hostembed.push(sername[i]);
            converted.push(onlineplayers[i] + '/' + totalplayers[i]);
            mapalias.push(client.function.getmap(mapcode[i]));
        }
    }

    let stat = new MessageEmbed()
        .setTitle('Status')
        .setColor(client.color)
        .setThumbnail(client.thumbnail)
        .addField('Hostname', hostembed, false)
        .addField('👥 Players', converted, true)
        .addField('\u200b', '\u200b', true)
        .addField('🗺️ Map', mapalias, true)
        .addField('⌛ Uptime', client.function.timeformat(infos[7]), false)
        .setFooter(`Page: ${Math.ceil(offset / max)}/${maxpages}`)
    message.channel.send(stat);
};

exports.conf = {
    aliases: ['s']
};