const dbutils = require('../include/dbutils');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args.length || args[0].match(/[a-z]/i)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'execute <serverid | ip:port | serial no. from status cmd> <!help>```');
    if (args[0] <= 0 || !(args.length >= 2)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'execute <serverid | ip:port | serial no. from status cmd> <!help>```');

    let dbresponse = await dbutils.getData(message.author.id);
    if (!dbresponse) return message.channel.send("You need to login to use this command.\nType: `" + client.config.prefix + "login`");

    const id = args.shift();

    if (id.length > 10 && id.length < 20) {
        var serverid = id.replace(/[^0-9]/g, '');
    } else {
        let infos = await client.function.fetchinfo(client.config.admin_id);
        if (infos[5].length >= id) {
            let conf = new MessageEmbed()
                .setColor(client.color)
                .setTitle("Confirmation")
                .setDescription("Do you want to execute this command in " + infos[0][id - 1].replace(/[0-9]+\. /g, '') + "?\n\n Send ``yes`` to confirm or any other message to cancel.")
                .setFooter("Server Id: " + infos[5][id - 1].replace(/[^0-9]/g, ''))
            let snt = await message.channel.send(conf);

            const ans = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 10000, errors: ["time"] })
                .catch(() => {
                    let timeout = new MessageEmbed()
                        .setAuthor("Timeout, command execution has been cancelled")
                        .setColor(client.color)
                    snt.edit(timeout);
                });
            if (!ans) return;
            if (!(ans.first().content.toLowerCase() == 'yes')) return message.channel.send("Execution Cancelled");
            var serverid = infos[5][id - 1].replace(/[^0-9]/g, '');
        } else {
            return message.channel.send('```css\nServer with provided id not found```');
        }
    }

    const cmdtoexecute = args.join(' ');
    let data = await client.function.execute(client.config.webfronturl, serverid, dbresponse.cookie, cmdtoexecute);

    if (data[0] === 404) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (data[0] === 401) return message.channel.send('Your Stored login has been expired. Kindly login again using ' + client.config.prefix + 'login');
    if (data[0] === 400) return message.channel.send(data[1]);

    let outmsg = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL({ format: "png" }))
        .setColor(client.color)
        .setDescription(data[2])
        .setFooter('Executed in ' + data[1] + ' ms')
    message.channel.send(outmsg);
};

exports.conf = {
    aliases: ['e']
};