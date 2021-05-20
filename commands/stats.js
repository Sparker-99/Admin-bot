const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args.length || isNaN(args[0])) return message.channel.send("Usage:```css\n" + client.config.prefix + "stats <client id>```");

    const response = await fetch(client.config.webfronturl + '/api/stats/' + args[0])
        .then((res) => res.json())
        .catch(() => { console.log('\x1b[31mWarning: ' + client.config.webfronturl + ' not reachable\x1b[0m') });

    if (!response) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (!response.length) return message.channel.send("No stats found for client id " + args[0])

    let max = response.length;
    let statmsg = new MessageEmbed()
        .setColor(client.color)
        .setFooter(client.footer)
        .setThumbnail(client.thumbnail)
        .setTitle(response[0].name.replace(/\^[0-9:;c]/g, '') + "'s Stat");

    for (i = 0; i < max; i++) {
        if (response[i]) {
            statmsg.addField("⫸ " + (response[i].serverGame.length === 0 ? "Unknown Game" : client.function.getgame(response[i].serverGame)[0]), "🔹 Rank: **#** " + response[i].ranking + "\n🔸 KD: " + ((response[i].kills === 0) && (response[i].deaths === 0) ? 0 : (response[i].kills / response[i].deaths).toFixed(2)) + "\n🔹 Kills: " + response[i].kills + "\n🔸 Deaths: " + response[i].deaths + "\n🔹 Performance: " + response[i].performance + "\n🔸 Time played: " + client.function.timeformat(response[i].totalSecondsPlayed), false);
        }
    }
    message.channel.send(statmsg);
};

exports.conf = {
    aliases: []
};