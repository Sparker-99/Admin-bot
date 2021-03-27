const fetch = require('node-fetch');
const { sendServerStatus } = require('../include/botutils');
module.exports = async (client) => {
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


    let data = await fetch('https://api.github.com/repos/Sparker-99/Admin-bot/releases/latest')
        .then((res) => res.json())
        .catch(() => { console.log('\x1b[31mUpdate check failed Github is not reachable\x1b[0m') });

    if (data)
        if (require('../package.json').version.replace(/[^0-9]/g, '') >= data.tag_name.replace(/[^0-9]/g, ''))
            console.log('\x1b[32mAdmin Bot is up to date\x1b[0m');
        else
            console.log('\x1b[33mAdmin bot version ' + data.tag_name + ' update is avaiable\x1b[0m');


    console.log('\nBot is online with id ' + client.user.id);
	
	// send server status to channel
    if (client.config.status_channel && client.config.status_delay) {
		sendServerStatus(client);
		setInterval(function () {
			sendServerStatus(client);
		}, client.config.status_delay * 1000);
    }
	
};