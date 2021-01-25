const fetch = require('node-fetch');
const dbutils = require('../include/dbutils');
exports.run = async (client, message) => {
    message.channel.send("📬 Kindly make sure your dm is open. You will be asked for id and password for <" + client.config.webfronturl + ">");
    let strdmsg = await message.author.send("➤ Please send your id and password in this format : YourId Password\n➤ Example: ```234 supersecretpass```");

    const answer = await message.author.dmChannel.awaitMessages(m => m.content.split(' ').length === 2, { max: 1, time: 30000, errors: ["time"] })
        .catch(() => {
            strdmsg.edit("Timeout! login create cancelled");
        });

    if (!answer) return;
    let info = answer.first().content.split(' ');
    if (isNaN(info[0])) return message.author.send("Incorrect login details provided. Client id must be a number. Login create cancelled");

    const response = await fetch(client.config.webfronturl + '/api/client/' + info[0] + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: `{"password":"` + info[1] + `"}` })
        .catch(() => { console.log('\x1b[31mWarning: ' + client.config.webfronturl + ' not reachable\x1b[0m') });

    if (!response) return message.author.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (!(response.status == 200)) return message.author.send("Incorrect login details provided. Login create cancelled");

    var value = response.headers.get('set-cookie').split(';').findIndex(element => element.includes(".AspNetCore.Cookies"));
    dbutils.insertData(message.author.id, info[0], response.headers.get('set-cookie').split(';')[value]);

    message.author.send("Success! your login is successfully stored.\nNote: We do not know or store your id and password");
};

exports.conf = {
    aliases: []
};