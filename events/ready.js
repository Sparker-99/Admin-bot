module.exports = (client) => {
    async function presence() {
        let infos = await client.function.fetchinfo(client.config.admin_id);
        if (infos) {
            var totalplayers = infos[1].reduce((a, b) => a + b, 0);
            var maxplayers = infos[2].reduce((a, b) => a + b, 0);
            var servercount = infos[3].length;
            client.user.setPresence({ activity: { name: client.config.custom_presence.replace(/{m}/g, maxplayers).replace(/{p}/g, totalplayers).replace(/{s}/g, servercount) }, status: 'online' });
        }
    }
    presence();
    setInterval(presence, 600000);
    console.log('Bot is online with id ' + client.user.id);
};