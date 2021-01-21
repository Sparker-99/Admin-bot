const os = require('os');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message) => {
    function msg() {
        let emb = new MessageEmbed()
            .setTitle("Bot Info")
            .setColor(client.color)
            .setThumbnail(client.thumbnail)
            .addField("Bot's memory usage [" + ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2) + "%]", (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB / " + (((os.totalmem() / 1024) / 1024) / 1024).toFixed(2) + " GB", true)
            .addField("Cpu usage [" + os.cpus().length + " cores]", (process.cpuUsage().user / 1024 / 1024).toFixed(2) + " MB", true)
            .addField("\u200b", "\u200b", true)
            .addField("Overall memory usage [" + Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%]", ((((os.totalmem() - os.freemem()) / 1024) / 1024) / 1024).toFixed(2) + " GB / " + (((os.totalmem() / 1024) / 1024) / 1024).toFixed(2) + " GB", true)
            .addField("Node Js version", process.versions.node, true)
            .addField("\u200b", "\u200b", true)
            .addField("Platform", process.platform.replace(/win32/g, "Windows"), true)
            .addField("Architecture", os.arch(), true)
            .addField("\u200b", "\u200b", true)
            .addField("Bot's Uptime", client.function.timeformat(client.uptime / 1000), false)
            .setFooter(client.footer)
        message.channel.send(emb);
    }

    if (client.config.ownerid)
        if (message.author.id === client.config.ownerid) msg();
        else message.channel.send('```css\nThis command is locked for owner```');
    else msg();
};

exports.conf = {
    aliases: ['binfo']
};