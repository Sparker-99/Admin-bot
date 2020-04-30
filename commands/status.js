const fetch = require('node-fetch');
const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    let response = await fetch('http://api.raidmax.org:5000/instance/' + client.config.adminid)
        .then(res => res.json())
        .then(json => json);
    if (response.servers) {
        function instancehandler() {
            var hostnames = new Array();
            var players = new Array();
            var gamemap = new Array();
            for (i = 0; i < 10; i++) {
                if (response.servers[i]) {
                    hostnames[i] = '🔹 ' + response.servers[i].hostname.replace(/[-\/\\^$*+?.()\d[\]{}]/g, '');
                    players[i] = response.servers[i].clientnum + '/' + response.servers[i].maxclientnum;
                    gamemap[i] = response.servers[i].map;
                }
            }
            return [hostnames, players, gamemap];
        }
        function secondsToString(uptime) {
            var days = Math.floor((uptime % 31536000) / 86400);
            var hours = Math.floor((uptime % 86400) / 3600);
            var minutes = Math.floor((uptime % 3600) / 60);
            var seconds = Math.round(uptime % 60);
            return (days > 0 ? days + " days, " : "") + (hours > 0 ? hours + " hours, " : "") + (minutes > 0 ? minutes + " minutes, " : "") + (seconds > 0 ? seconds + " seconds" : "");
        }
        let infos = instancehandler();
        const host = infos[0];
        const playerstats = infos[1];
        const map = infos[2];
        const uptime = secondsToString(response.uptime);

        const embed = new Discord.RichEmbed()
            .setTitle('Status')
            .setThumbnail('https://raidmax.org/IW4MAdmin/img/iw4adminicon-3.png')
            .setColor(client.color)
            .addField('Hostname', host, false)
            .addField('Players', playerstats, true)
            .addField('\u200b', '\u200b', true)
            .addField('Map', map, true)
            .addField('Admin version', response.version, false)
            .addField('⌛ Uptime', uptime, false);

        message.channel.send(embed);
    } else {
        message.channel.send('```css\nInstance with the provided admin id is not found```');
    }
}