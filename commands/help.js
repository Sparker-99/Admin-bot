const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setTitle('Help')
        .setColor(client.color)
        .setDescription('🔸' + client.config.prefix + "status - shows top 10 server's status\n" + '🔹' + client.config.prefix + "ping - shows bot's ping\n" + '🔸' + client.config.prefix + "botinfo - shows bot's overall status")
        .setFooter('Bot by Sparker, IW4M Admin by Raidmax');
    message.channel.send(embed);

}