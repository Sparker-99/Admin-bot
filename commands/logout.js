const fetch = require('node-fetch');
const dbutils = require('../include/dbutils');
exports.run = async (client, message) => {
    let dbres = await dbutils.getData(message.author.id);
    if (!dbres) return message.channel.send("You are not logged in");

    const response = await fetch(client.config.webfronturl + '/api/client/' + dbres.client_id + '/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': dbres.cookie } })
        .catch(() => { console.log('\x1b[31mWarning: ' + client.config.webfronturl + ' not reachable\x1b[0m') });

    if (!response) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (!(response.status == 200)) return message.author.send("Failed to logout please try again later");

    dbutils.deleteData(message.author.id);
    message.channel.send("You have been successfully logged out!");
};

exports.conf = {
    aliases: [],
    permissions: ['SEND_MESSAGES']
};