const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = require('node-fetch');
const dbutils = require('../../../include/dbutils');

module.exports = {
    name: "execute",
    description: "gets game servers status",
    type: 1,
    options: [{
        name: "command",
        description: "!<command>",
        type: 3,
        required: true
    }],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages"
    },
    run: async (client, interaction, config, db) => {
        let timestamp = interaction.createdTimestamp;
        await interaction.deferReply({ ephemeral: true });
        let dbresponse = await dbutils.getData(interaction.member.id);
        if (!dbresponse) return interaction.editReply({ ephemeral: true, content: "You need to login to use this command.\nType: `" + "/login`" });

        var command = interaction.options.get('command')?.value;
        let objects = [];
        let infos = await client.function.fetchinfo(config.Client.webfronturl);
        if (!infos) return interaction.editReply({ ephemeral: true, content: '```css\nInstance not reachable```' });
        function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

        let i = 0;
        Object.values(infos.hostnames).forEach(o => {
            objects.push({
                label: `${o}`,
                description: `map: ${infos.gamemap[i]}`,
                value: `${i + 1}`
            });
            i++;
        });

        const id = new SelectMenuBuilder()
            .setCustomId('id' +timestamp)
            .setPlaceholder('')
            .addOptions(objects);
            

        const ActionRow = new ActionRowBuilder().addComponents(id);

        let sid;
        await interaction.editReply({ ephemeral: true, content: 'Select server to send command', components: [ActionRow] });

        client.on('interactionCreate', interaction => {
            if (!interaction.isSelectMenu() && interaction.isCommand()) return;
            if (interaction.customId !== 'id' + timestamp) return;
            if (interaction.customId === 'id' + timestamp) {
                interaction.update({ ephemeral: true, content: 'server was selected!', components: [] })
                    .catch(console.error);
                sid = interaction.values[0];   
            }
        });
        let j = 0;
        while (!sid && i < 300 ) {
            await timer(1000);
            j++;
        }
        if (!sid) {
            await interaction.followUp({ ephemeral: true, content: `execute command timed out` })
        }
        else {
            var serverid = infos.servip[sid].replace(/[^0-9]/g, '');
            let data = await client.function.execute(config.Client.webfronturl, serverid, dbresponse.cookie, command);

            if (data[0] === 404) return interaction.followUp({ ephemeral: true, content: "Cannot establish connection to <" + config.Client.webfronturl + ">" });
            if (data[0] === 401) return interaction.followUp({ ephemeral: true, content: 'Your Stored login has been expired. Kindly login again using ' +'/login' });
            if (data[0] === 400) return interaction.followUp({ ephemeral: true, content: data[1] });

            let outmsg = new EmbedBuilder()
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ format: "png" }) })
                .setColor(config.Client.color)
                .setDescription(data[2].toString())
                .setFooter({ text: 'Executed in ' + data[1] + ' ms' })
            interaction.followUp({ ephemeral: true, embeds: [outmsg] });
        }
    },
};
