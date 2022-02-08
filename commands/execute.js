const { MessageEmbed } = require('discord.js');
exports.run = async (client, message, args) => {
    if (!args.length || args[0].match(/[a-z]/i)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'execute <serverid | ip:port | serial no. from status cmd> <!help>```');
    if (args[0] <= 0 || !(args.length >= 2)) return message.channel.send('Incorrect Usage. Example:```css\n' + client.config.prefix + 'execute <serverid | ip:port | serial no. from status cmd> <!help>```');

    let dbresponse = await client.db.prepare("SELECT * FROM userinfo WHERE id = @id;").get({ id: message.author.id });
    if (!dbresponse) return message.channel.send("You need to login to use this command.\nType: `" + client.config.prefix + "login`");

    let indx;
    let id = args.shift();
    let infos = await client.function.fetchinfo(client.config.webfronturl);

    if (/[0-9]+.[0-9]+.[0-9]+.[0-9]+:[0-9]{1,5}$/.test(id)) {

        indx = infos.servip.findIndex((elm) => elm === id);

        if (indx === -1) {
            let myip = await client.function.getexip(client);
            if (!myip) return message.channel.send('```css\nExternal ip fetcher is down kindly use server number, server id or internal ip```');

            let exip = await infos.servip.map(el => {
                if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(el)) return myip + ':' + el.split(":")[1];
                else return el;
            });

            indx = exip.findIndex((elem) => elem === id);
        }

        if (indx === -1) return message.channel.send('```css\nServer with provided ip not found```');

    } else if ((id.length > 9 && id.length < 22) && !/[^\w\s]/g.test(id)) {

        indx = infos.servip.findIndex((elm) => elm.replace(/[^0-9]/g, '') === id);
        if (indx === -1) return message.channel.send('```css\nServer with provided id not found```');

    } else if (infos.hostnames.length >= id) indx = id - 1;

    else return message.channel.send('```css\nNo such servers found```');

    let conf = new MessageEmbed()
        .setColor(client.color)
        .setTitle("Confirmation")
        .setDescription("Do you want to execute this command in " + infos.hostnames[indx].replace(/[0-9]+\. /g, '') + "?\n\n Send ``yes`` to confirm or any other message to cancel.")
        .setFooter({ text: "Server Id: " + infos.servip[indx].replace(/[^0-9]/g, '') })
    let snt = await message.channel.send({ embeds: [conf] });

    const ans = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 10000, errors: ["time"] })
        .catch(() => {
            let timeout = new MessageEmbed()
                .setAuthor({ name: "Timeout, command execution has been cancelled" })
                .setColor(client.color)
            snt.edit({ embeds: [timeout] });
        });
    if (!ans) return;
    if (!(ans.first().content.toLowerCase() == 'yes')) return message.channel.send("Execution Cancelled");
    var serverid = infos.servip[indx].replace(/[^0-9]/g, '');

    const cmdtoexecute = args.join(' ');
    let data = await client.function.execute(client.config.webfronturl, serverid, dbresponse.cookie, cmdtoexecute);

    if (data[0] === 404) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (data[0] === 401) return message.channel.send('Your Stored login has been expired, kindly login again.\nType: `' + client.config.prefix + 'login`');
    if (data[0] === 400) return message.channel.send(data[1]);

    let outmsg = new MessageEmbed()
        .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: "png" }) })
        .setColor(client.color)
        .setDescription(data[2].toString())
        .setFooter({ text: 'Executed in ' + data[1] + ' ms' })
    message.channel.send({ embeds: [outmsg] });
};

exports.conf = {
    aliases: ['e'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};