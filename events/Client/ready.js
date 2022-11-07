const client = require("../../index");
const colors = require("colors");
const fetch = require('node-fetch');
const dbutils = require('../../include/dbutils');
const { MessageEmbed } = require('discord.js');
const config = require("../../config/config.js");




module.exports = {
    name: "ready"
};



client.once('ready', async (client) => {

    async function presence() {
        let infos = await client.function.fetchinfo(config.Client.webfronturl);
        if (infos) {
            var currplayers = infos.players.reduce((a, b) => a + b, 0);
            var maxplayers = infos.maxplayers.reduce((a, b) => a + b, 0);
            var servercount = infos.gamemap.length;
            client.user.setPresence({ activities: [{ name: config.Client.custom_presence.replace(/{m}/g, maxplayers).replace(/{p}/g, currplayers).replace(/{s}/g, servercount) }], status: 'online' });
        }
    }
    presence();
    if (config.Client.custom_presence.match(/\{[mps]\}/g)) setInterval(presence, 600000);

    let data = await fetch('https://api.github.com/repos/Sparker-99/Admin-bot/releases/latest')
        .then((res) => res.json())
        .catch(() => { console.log('\x1b[31mUpdate check failed Github is not reachable\x1b[0m') });
    if (data) {
        if (require('../../package.json').version.replace(/[^0-9]/g, '') >= data.tag_name.replace(/[^0-9]/g, ''))
            console.log('\x1b[32mAdmin Bot is up to date\x1b[0m');
        else
            console.log('\x1b[33mAdmin bot version ' + data.tag_name + ' update is avaiable\x1b[0m');
    }
    async function processids(infos, pages, chanfnd) {
        let embld = [];
        let embids = [];
        let count = 0;
        let embsl = Math.ceil(infos.hostnames.length / pages);

        for (i = 0; i < embsl; i++) {
            embld[i] = new MessageEmbed().setColor(client.color);
            if (i == 0) embld[i].setTitle('Server Status').setThumbnail(client.thumbnail);

            for (g = 0; g < pages; g++) {
                if (infos.hostnames[count]) {
                    embld[i].addField(infos.hostnames[count], client.function.getmap(infos.gamemap[count], infos.gamename[count])[0] + ' - ' + infos.players[count] + '/' + infos.maxplayers[count], false);
                    count++;
                }
            }
            try {
                dar = await chanfnd.send({ embeds: [embld[i]] });
                embids.push(dar.id);
            } catch { }
        }
        return embids;
    }

    if (config.Client.status_channel_id && config.Client.statchan_update_interval) {
        let init = setInterval(async function () {
            let statchan = await client.channels.fetch(config.Client.status_channel_id)
                .catch(() => {
                    console.log('\x1b[31mWarning: Text channel with Id ' + config.Client.status_channel_id + ' not found. Disabling autostatus\x1b[0m');
                    clearInterval(init);
                });

            if (!statchan) return;
            if (!statchan.guild.me.permissionsIn(statchan).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
                console.log('\x1b[33mWarning: Send messages and embed links permissions are required in channel ' + statchan.name + '. Disabling autostatus\x1b[0m');
                return clearInterval(init);
            }

            let srdata = await client.function.fetchinfo(config.Client.webfronturl);
            if (!srdata) return;

            let fetchids = await dbutils.fetchData(statchan.id);
            let msgids = await processids(srdata, config.Client.results_perpage, statchan);
            dbutils.appendData(statchan.id, msgids.join());

            if (fetchids) {
                let rearr = fetchids.msgids.split(',');
                for (i = 0; i < rearr.length; i++) {
                    let fnd = await client.channels.cache.get(statchan.id).messages.fetch(rearr[i]).catch(() => { });
                    if (fnd) fnd.delete();
                }
            }
        }, config.Client.statchan_update_interval * 1000)
    }

    console.log("\n" + `[READY] ${client.user.tag}  is online with id ${client.user.id}`.brightGreen);
})