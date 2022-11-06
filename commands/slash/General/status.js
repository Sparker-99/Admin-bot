const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "status", // Name of command
    description: "gets game servers status", // Command description
    type: 1, // Command type
    options: [
        {
        name: "page",
        description: "gets the specified page number",
        type: 4,
        required: false
    }], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });
        var page = interaction.options.get('page')?.value;
        //if (args[0] && isNaN(args[0])) return interaction.reply('```css\nFormat:\nstatus <page number>```');
        let infos = await client.function.fetchinfo(config.Client.webfronturl);
        if (!infos) return interaction.editReply({ ephemeral: true, content: '```css\nInstance not reachable```' });

        let offset;
        let sername = infos.hostnames;
        let onlineplayers = infos.players;
        let totalplayers = infos.maxplayers;
        let mapcode = infos.gamemap;
        let gamename = infos.gamename;
        let max = config.Client.results_perpage;
        let less = max - 1;

        let stat = new EmbedBuilder()
            .setTitle('Status')
            .setColor(config.Client.color)
            .setThumbnail(client.thumbnail);

        page = Math.ceil(page);
        const maxpages = Math.ceil((totalplayers.length / max));
        if (page > maxpages) { page = page - (page - maxpages) }
        if (!page || page <= 1) { offset = 1 } else { offset = page * max - less }

        for (i = (offset - 1); i <= (offset - 1) + less; i++) {
            if (sername[i]) {
                stat.addFields(
                    {name: sername[i], value: client.function.getmap(mapcode[i], gamename[i])[0] + ' - ' + onlineplayers[i] + '/' + totalplayers[i], inline: false});
            }
        }
        var footer = `Page: ${Math.ceil(offset / max)}/${maxpages}`;
        stat.setFooter({ text: footer });
        interaction.editReply({ embeds: [stat], ephemeral: true });
    },
};