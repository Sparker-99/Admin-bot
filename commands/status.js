const { MessageEmbed } = require('discord.js');
exports.run = async (client, message) => {
    let infos = await client.function.fetchinfo(client.config.admin_id, 10);
    if (infos) {
        let onlineplayers = infos[1];
        let totalplayers = infos[2];
        let mapcode = infos[3];
        let converted = [];
        let mapalias = [];
        var arraysize = totalplayers.length;
        for (i = 0; i < arraysize; i++) {
            converted[i] = onlineplayers[i] + '/' + totalplayers[i];
            mapalias[i] = client.function.getmap(mapcode[i]);
        }
        let stat = new MessageEmbed()
            .setTitle('Status')
            .setColor(client.color)
            .setThumbnail(client.thumbnail)
            .addField('Hostname', infos[0], false)
            .addField('👥 Players', converted, true)
            .addField('\u200b', '\u200b', true)
            .addField('🗺️ Map', mapalias, true)
            .addField('⌛ Uptime', client.function.timeformat(infos[4]), false)
            .setFooter(client.footer)
        message.channel.send(stat);
    } else {
        message.channel.send('```css\n Instance with the provided admin id is not found```');
    }
}