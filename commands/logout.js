const fetch = require('node-fetch');
exports.run = async (client, message) => {
    let dbres = await client.db.prepare("SELECT * FROM userinfo WHERE id = @id;").get({ id: message.author.id });
    if (!dbres) return message.channel.send("You are not logged in");

    const response = await fetch(client.config.webfronturl + '/api/client/' + dbres.client_id + '/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': dbres.cookie } })
        .catch(() => { console.log('\x1b[31mWarning: ' + client.config.webfronturl + ' not reachable\x1b[0m') });

    if (!response) return message.channel.send("Cannot establish connection to <" + client.config.webfronturl + ">");
    if (!(response.status == 200)) return message.author.send("Failed to logout please try again later");

    await client.db.prepare("DELETE FROM userinfo WHERE id = @id;").run({ id: message.author.id });
    message.channel.send("You have been successfully logged out!");
};

exports.conf = {
    aliases: [],
    permissions: ['SEND_MESSAGES']
};