const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    const embed = new Discord.RichEmbed()
        .setTitle('🏓 Pong : ' + Math.floor(client.ping) + 'ms')
        .setColor(client.color)
    message.channel.send(embed);

}