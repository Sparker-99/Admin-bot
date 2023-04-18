const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fetch = require('node-fetch');
const dbutils = require('../../../include/dbutils');

function chunkify(arr, len) {
  let chunks = [];
  let i = 0;
  let n = arr.length;

  while (i < n)
    chunks.push(arr.slice(i, (i += len)));

  return chunks;
}
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
        let i = 0
        let infos = await client.function.fetchinfo(config.Client.webfronturl)

        if (!infos) return interaction.editReply({ ephemeral: true, content: '```css\nInstance not reachable```' });
        function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

        let options = infos.hostnames.map((server) => ({

            label: `${server}`,
            description: `map= ${infos.gamemap[i]}`,
            value:`${++i}`,
        }));

        let selectMenus = [
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
            .setCustomId('id' +timestamp)
            .setPlaceholder('Nothing selected')
            .addOptions([
                {
                label: `Cancel`,
                description: 'Cancel the server selection',
                value: 'cancel',
                },
            ]),
        ),
        ];
        if (options.length <= 24) {
        selectMenus[0].components[0].addOptions(options);
    
        }
    else
    {
        const chunks = chunkify(options, 24);

        chunks.forEach((options, k) => {
        if (k === 0)
            selectMenus[0].components[0].addOptions(options);

        else
            selectMenus.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                .setCustomId(`id` +timestamp + `-${k}`)
                .setPlaceholder('Nothing selected')
                .addOptions(options),
            ),
            );
        });
    }

        await interaction.editReply({ephemeral: true, content: 'Select server to send command', components: selectMenus });

        let sid;
        client.on('interactionCreate', interaction => {
            if (!interaction.isStringSelectMenu() && interaction.isCommand()) return;
            if (!interaction.customId.includes('id' + timestamp) ) return;
            if (interaction.customId.includes('id' + timestamp)) {
                interaction.update({ ephemeral: true, content: 'server was selected!', components: [] })
                    .catch(console.error);
                sid = interaction.values[0]; 
            }
        });
        let p = 0;
        while (!sid && p < 300 ) {
            await timer(1000);
            p++;
        }
        if (!sid) {
            await interaction.followUp({ ephemeral: true, content: `execute command timed out` })
        }
        else if(sid.includes('cancel'))
        {
            await interaction.followUp({ ephemeral: true, content: `execute command cancelled` })
        }
        else {
            var serverid = infos.ids[sid-1];
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
