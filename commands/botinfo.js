const os = require('os');
const Discord = require('discord.js');
exports.run = async (client, message, args) => {

    function time(uptime) {
        var days = Math.floor((uptime % 31536000) / 86400);
        var hours = Math.floor((uptime % 86400) / 3600);
        var minutes = Math.floor((uptime % 3600) / 60);
        var seconds = Math.round(uptime % 60);
        return (days > 0 ? days + " days, " : "") + (hours > 0 ? hours + " hours, " : "") + (minutes > 0 ? minutes + " minutes, " : "") + (seconds > 0 ? seconds + " seconds" : "");
    }
    const plat = process.platform.replace
    const embed = new Discord.RichEmbed()
        .setTitle('Bot Info')
        .setColor(client.color)
        .addField('Memory usage [' + Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + '%]', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB / ' + (((os.totalmem() / 1024) / 1024) / 1024).toFixed(2) + ' GB', true)
        .addField('\u200b', '\u200b', true)
        .addField('Cpu usage [' + os.cpus().length + ' cores]', (process.cpuUsage().user / 1024 / 1024).toFixed(2) + ' MB', true)
        .addField('Platform', process.platform.replace(/win32/g, 'Windows'), true)
        .addField('Node Js version', process.versions.node, true)
        .addField('Uptime', time(client.uptime), false)
    message.channel.send(embed);
}