module.exports = (client) => {
    async function presence() {
        let infos = await client.function.fetchinfo(client.config.admin_id);
        if (infos) {
            var totalplayers = infos[1].reduce((a, b) => a + b, 0);
            var maxplayers = infos[2].reduce((a, b) => a + b, 0);
            var servercount = infos[3].length;

            if (client.config.presence_template == 1) {
                client.user.setPresence({ activity: { name: totalplayers + ' players | ' + client.config.prefix + 'help', type: 'WATCHING' }, status: 'online' });
            } else if (client.config.presence_template == 2) {
                client.user.setPresence({ activity: { name: totalplayers + ' players out of ' + maxplayers + ' players', type: 'WATCHING' }, status: 'online' });
            } else if (client.config.presence_template == 3) {
                client.user.setPresence({ activity: { name: totalplayers + ' players out of ' + maxplayers + ' players in ' + servercount + ' servers', type: 'WATCHING' }, status: 'online' });
            }
        }
    }

    if (client.config.presence_update_interval) {
        presence();
        setInterval(presence, client.config.presence_update_interval * 1000);
    } else {
        client.user.setPresence({ activity: { name: client.config.prefix + 'help', type: 'LISTENING' }, status: 'online' });
    }

    console.log('Bot is online with id ' + client.user.id);
};