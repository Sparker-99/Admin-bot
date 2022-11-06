const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "serverinfo", // Name of command
    description: "gets detailed info for a server", // Command description
    type: 1, // Command type
    options: [{
        name: "server",
        description: "use a server number from /status",
        type: 4,
        required: true
    }], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });
        var server = interaction.options.get('server')?.value;
        let infos = await client.function.fetchinfo(config.Client.webfronturl);
        if (!infos) return interaction.editReply({ ephemeral: true, content: '```css\nInstance not reachable```' });

        let sername = infos.hostnames;
        let inp = server - 1;

        if (!sername[inp]) return interaction.editReply({ ephemeral: true, content: '```css\nInstance with the provided server number is not found use status to get all avaiable numbers```' });
        let data = client.function.getinfo(infos.gameparser[inp], infos.servip[inp], infos.gametype[inp]);
        let mapdata = client.function.getmap(infos.gamemap[inp], infos.gamename[inp]);
        if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(data[1].split("//")[1]))
            data[1] = data[1].split("//")[0] + '//' + await client.function.getexip(client) + ':' + data[1].split(":").pop();

        let msg = new EmbedBuilder()
            .setTitle('Serverinfo')
            .setColor(config.Client.color)
            .setThumbnail(mapdata[1].replace(/na/g, client.thumbnail))
            .addFields({ name: 'Hostname', value: sername[inp].replace(/[0-9]+\. /g, '🔹 '), inline: false })
            .addFields({ name: 'Players', value: infos.players[inp] + '/' + infos.maxplayers[inp], inline: true })
            .addFields({ name: 'Gametype', value: client.function.getmode(infos.gametype[inp]).toString(), inline: true })
            .addFields({ name: 'Map', value: mapdata[0], inline: false})
            .addFields({ name: 'Client', value: data[0] + ' [[Connect](https://applauncher.herokuapp.com/redirect?url=' + data[1] + ')]', inline: true })
            .setFooter({ text: 'ID: ' + infos.servip[inp].replace(/[^0-9]/g, ''), icon_url: client.function.getgame(infos.gamename[inp])[1].replace(/ukn/g, client.thumbnail) })
        interaction.editReply({ embeds: [msg], ephemeral: true });
    },
};