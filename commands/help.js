const { MessageEmbed } = require('discord.js');
exports.run = async (client, message) => {
    const embed = new MessageEmbed()
        .setTitle('Help')
        .setColor(client.color)
        .setThumbnail(client.thumbnail)
        .setDescription('🔸' + client.config.prefix + "status - shows top 10 server's status\n" + '🔹' + client.config.prefix + "ping - shows bot's ping\n" + '🔸' + client.config.prefix + "botinfo - shows bot's overall status")
        .setFooter(client.footer);
    message.channel.send(embed);
}