const { EmbedBuilder } = require("discord.js");
const fetch = require('node-fetch');
const dbutils = require('../../../include/dbutils');

module.exports = {
    name: "logout",
    description: "log out of the bot",
    type: 1,
    options: [],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages"
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });
        let dbres = await dbutils.getData(interaction.member.id);
        if (!dbres) return interaction.editReply({ ephemeral: true, content: "You are not logged in" });

        const response = await fetch(config.Client.webfronturl + '/api/client/' + dbres.client_id + '/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': dbres.cookie } })
            .catch(() => { console.log('\x1b[31mWarning: ' + interaction.client.config.webfronturl + ' not reachable\x1b[0m') });

        if (!response) return interaction.editReply({ ephemeral: true, content: "Cannot establish connection to <" + interaction.client.config.webfronturl + ">" });
        if (!(response.status == 200)) return interaction.editReply({ ephemeral: true, content: "Failed to logout please try again later" });

        dbutils.deleteData(interaction.member.id);
        interaction.editReply({ ephemeral: true, content: "You have been successfully logged out!" });

    },

};
