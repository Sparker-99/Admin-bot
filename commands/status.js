const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (args[0] && isNaN(args[0])) return message.channel.send('```css\nFormat:\nstatus <page number>```');
    let infos = await client.function.fetchinfo(client.config.webfronturl);
    if (!infos) return message.channel.send('```css\nInstance not reachable```');

    let offset;
    let sername = infos.hostnames;
    let onlineplayers = infos.players;
    let totalplayers = infos.maxplayers;
    let mapcode = infos.gamemap;
    let gamename = infos.gamename;
    let max = client.config.results_perpage;
    let less = max - 1;

    let stat = new MessageEmbed()
        .setTitle('Status')
        .setColor(client.color)
        .setThumbnail(client.thumbnail);

    args[0] = Math.ceil(args[0]);
    const maxpages = Math.ceil((totalplayers.length / max));
    if (args[0] > maxpages) { args[0] = args[0] - (args[0] - maxpages) }
    if (!args[0] || args[0] <= 1) { offset = 1 } else { offset = args[0] * max - less }

    for (i = (offset - 1); i <= (offset - 1) + less; i++) {
        if (sername[i]) {
            stat.addField(sername[i], client.function.getmap(mapcode[i], gamename[i])[0] + ' - ' + onlineplayers[i] + '/' + totalplayers[i], false);
        }
    }

    stat.setFooter({ text: `Page: ${Math.ceil(offset / max)}/${maxpages}` });
    message.channel.send({ embeds: [stat] });
};

exports.conf = {
    aliases: ['s'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};