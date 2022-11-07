const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: "stats", // Name of command
    description: "gets game servers status", // Command description
    type: 1, // Command type
    options: [
        {
            name: "clientid",
            description: "<Client Id> use /find <name> to get",
            type: 3,
            required: true
        }], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });
        var clientid = interaction.options.get('clientid')?.value;
        //if (args[0] && isNaN(args[0])) return interaction.reply('```css\nFormat:\nstatus <page number>```');
        const response = await fetch(config.Client.webfronturl + '/api/stats/' + clientid)
            .then((res) => res.json())
            .catch(() => { console.log('\x1b[31mWarning: ' + config.Client.webfronturl + ' not reachable\x1b[0m') });


        if (!response) return interaction.editReply({ ephemeral: true, content: "Cannot establish connection to <" + config.Client.webfronturl + ">" });
        if (!response.length) return interaction.editReply({ ephemeral: true, content: "No stats found for client id " + clientid })

        let max;
        if (response.length > 25) max = 25;
        else max = response.length;
        let statmsg = new EmbedBuilder()
            .setColor(config.Client.color)
            .setFooter({ text: config.Client.footer })
            .setThumbnail(client.thumbnail)
            .setTitle(response[0].name.replace(/\^[0-9:;c]/g, '') + "'s Stat");

        for (i = 0; i < max; i++) {
            if (response[i]) {
                statmsg.addFields({name: "⫸ " + (response[i].serverName.length === 0 ? "Unknown Server Name" : response[i].serverName),value: "🔹 Rank: **#** " + response[i].ranking + "\n🔸 KD: " + ((response[i].kills === 0) && (response[i].deaths === 0) ? 0 : (response[i].kills / response[i].deaths).toFixed(2)) + "\n🔹 Kills: " + response[i].kills + "\n🔸 Deaths: " + response[i].deaths + "\n🔹 Performance: " + response[i].performance + "\n🔸 Time played: " + client.function.timeformat(response[i].totalSecondsPlayed), inline: false});
            }
        }
        interaction.editReply({ embeds: [statmsg], ephemeral: true });
    },

};