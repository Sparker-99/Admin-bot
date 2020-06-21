const Discord = require('discord.js');
exports.run = async (client, message) => {
    const embed = new Discord.MessageEmbed()
        .setTitle('🏓 Pong : ' + Math.floor(client.ws.ping) + 'ms')
        .setColor(client.color)
    message.channel.send(embed);

}