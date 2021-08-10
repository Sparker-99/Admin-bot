const { MessageEmbed } = require('discord.js');
exports.run = (client, message) => {
    const embed = new MessageEmbed()
        .setTitle('🏓 Pong : ' + Math.floor(client.ws.ping) + 'ms')
        .setColor(client.color)
    message.channel.send({ embeds: [embed] });
};

exports.conf = {
    aliases: [],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};