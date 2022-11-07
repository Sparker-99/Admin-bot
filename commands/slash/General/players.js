const { EmbedBuilder } = require('discord.js');
const stringtable = require('string-table');

module.exports = {
    name: "players", // Name of command
    description: "gets list of players for a server", // Command description
    type: 1, // Command type
    options: [{
        name: "serverid",
        description: "<serverid | ip:port | serial no. from status cmd>",
        type: 3,
        required: true
    },
        {
            name: "page",
            description: "gets the specified page number",
            type: 4,
            required: false
        }    ], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });
        const id = interaction.options.get('serverid')?.value;
        var page = interaction.options.get('page')?.value;

        if (id.match(/[a-z]/i) || id <= 0) return interaction.editReply({ content: 'Incorrect Usage. Example:```css\n' + '/players <serverid | ip:port | serial no. from status cmd> <page no.>```', ephemeral: true });
        if (page) {
            if (page <= 0) return interaction.editReply({ content: 'Incorrect Usage. Example:```css\n' + '/players <serverid | ip:port | serial no. from status cmd> <page no.>```', ephemeral: true});
        }
        let indx;
        let infos = await client.function.fetchinfo(config.Client.webfronturl);
        if (!infos) return interaction.editReply({ ephemeral: true, content: '```css\nInstance not reachable```' });

        if (/[0-9]+.[0-9]+.[0-9]+.[0-9]+:[0-9]{1,5}$/.test(id)) {
            indx = infos.servip.findIndex((elm) => elm === id);
            if (indx === -1) {
                let myip = await client.function.getexip(client);
                if (!myip) return interaction.editReply({ content: '```css\nExternal ip fetcher is down kindly use server number, server id or internal ip```', ephemeral: true });

                let exip = await infos.servip.map(el => {
                    if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(el)) return myip + ':' + el.split(":")[1];
                    else return el;
                });

                indx = exip.findIndex((elem) => elem === id);

            }
            if (indx === -1) return interaction.editReply({ ephemeral: true, content: '```css\nServer with provided ip not found```'});
        }
        else if ((id.length > 9 && id.length < 22) && !/[^\w\s]/g.test(id)) {
            indx = infos.servip.findIndex((elm) => elm.replace(/[^0-9]/g, '') === id);
            if (indx === -1) return interaction.editReply({ ephemeral: true, content: '```css\nServer with provided id not found```'});
        }
        else if (infos.hostnames.length >= id) indx = id - 1;
        else return interaction.editReply({ ephemeral: true, content: '```css\nNo such server found```'});


        let data = await client.function.fetchplayers(config.Client.webfronturl, infos.servip[indx].replace(/[^0-9]/g, ''));
        if (data === 400) return interaction.editReply({ ephemeral: true, content: "Server with provided id not found"});
        if (data === 404) return interaction.editReply({ ephemeral: true, content: "Cannot establish connection to <" + config.Client.webfronturl + ">" });

        if (!data.playerinfo) {
            const empty = new EmbedBuilder()
                .setColor(config.Client.color)
                .setDescription("```" + data.serverinfo[1] + " is empty```")
                .setFooter({ text: "ID: " + data.serverinfo[0] })
            return interaction.edit({ embeds: [empty], ephemeral: true });
        }

        let offset;
        let players = [];
        let max = config.Client.results_perpage;
        let less = max - 1;

        pgno = Math.ceil(page);
        const maxpages = Math.ceil((data.playerinfo.length / max));
        if (pgno > maxpages) { pgno = pgno - (pgno - maxpages) }
        if (!pgno || pgno <= 1) { offset = 1 } else { offset = pgno * max - less }

        for (i = (offset - 1); i <= (offset - 1) + less; i++) {
            if (data.playerinfo[i]) {
                players.push({ No: i + 1, Name: "[" + data.playerinfo[i][0] + "] " + data.playerinfo[i][1], Score: data.playerinfo[i][2], Ping: data.playerinfo[i][3] });
            }
        }

        let td = stringtable.create(players);

        const plst = new EmbedBuilder()
            .setTitle(data.serverinfo[1])
            .setColor(config.Client.color)
            .setDescription(`\`\`\`${td}\`\`\``)
            .setFooter({ text: `Page: ${Math.ceil(offset / max)}/${maxpages}` })
        interaction.editReply({ embeds: [plst], ephemeral: true });


    },
};