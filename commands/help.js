const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (args[0] && !isNaN(args[0])) return message.channel.send("Command name cannot be a number");
    if (!args[0]) args[0] = 'none';

    switch (args[0].toLowerCase()) {
        case ('status'):
            message.channel.send("```css\n" + client.config.prefix + "status <Page Number>\nAlias: " + client.config.prefix + "s```");
            break;
        case ('serverinfo'):
            message.channel.send("```css\n" + client.config.prefix + "serverinfo <Serial Number from Status command>\nAlias: " + client.config.prefix + "sinfo```");
            break;
        case ('players'):
            message.channel.send("```css\n" + client.config.prefix + "players <Serverid | ip:port | Serial No. from Status command> <page number>\nAlias: " + client.config.prefix + "p, " + client.config.prefix + "scoreboard```");
            break;
        case ('find'):
            message.channel.send("```css\n" + client.config.prefix + "find <name of the player | xuid of the player>\nAlias: " + client.config.prefix + "f```");
            break;
        case ('stats'):
            message.channel.send("```css\n" + client.config.prefix + "stats <client id from " + client.config.webfronturl + ">\nAlias: none```");
            break;
        case ('login'):
            message.channel.send("```css\n" + client.config.prefix + "login\nMethod: Your id and password for " + client.config.webfronturl + " will be asked in DM```");
            break;
        case ('logout'):
            message.channel.send("```css\n" + client.config.prefix + "logout\nAlias: none```");
            break;
        case ('execute'):
            message.channel.send("```css\n" + client.config.prefix + "execute <Serverid | ip:port | Serial No. from Status command> <!help>\nAlias: " + client.config.prefix + "e```");
            break;
        case ('botinfo'):
            message.channel.send("```css\n" + client.config.prefix + "botinfo\nAlias: " + client.config.prefix + "binfo```");
            break;
        case ('ping'):
            message.channel.send("```css\n" + client.config.prefix + "ping\nAlias: none```");
            break;
        default:
            const emc = new MessageEmbed()
                .setTitle('Help')
                .setColor(client.color)
                .setThumbnail(client.thumbnail)
                .setDescription("🔸 `" + client.config.prefix + "status` - Shows all iw4m admin server's status\n" + "🔹 `" + client.config.prefix + "serverinfo` - Shows info about given server number\n" + "🔸 `" + client.config.prefix + "players` - Shows player scoreboard for the given server\n" + "🔹 `" + client.config.prefix + "find` - Shows name, iw4m client id and xuid of found clients\n" + "🔸 `" + client.config.prefix + "stats` - Shows all stats about the player\n" + "🔹 `" + client.config.prefix + "login` - Asks you for login info in dm\n" + "🔸 `" + client.config.prefix + "logout` - Deletes your login and log you out\n" + "🔹 `" + client.config.prefix + "execute` - Executes the command in the given server\n" + "🔹 `" + client.config.prefix + "botinfo` - Shows bot's overall status\n" + "🔸 `" + client.config.prefix + "ping` - Shows bot's latency to discord\n" + "```Use " + client.config.prefix + "help <command name> or " + client.config.prefix + "h <command name> to get more info about the command```")
                .setFooter(client.footer);
            message.channel.send(emc);
    }
};

exports.conf = {
    aliases: ['h']
};