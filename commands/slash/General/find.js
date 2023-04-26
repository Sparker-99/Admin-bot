const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const stringtable = require('string-table');
const joi = require('joi');
const schema = joi.object({

    user: joi.string()
        .pattern(new RegExp('^[A-Za-z0-9!@#$%^&*_+=,.<>\/?-]{3,32}$'))
        .min(3)
        .max(32)
        .required(),

})
module.exports = {
    name: "find", // Name of command
    description: "searches for a user", // Command description
    type: 1, // Command type
    options: [{
        name: "user",
        description: "<name | xuid>",
        type: 3,
        required: true
    }], // Command options
    permissions: {
        DEFAULT_PERMISSIONS: "", // Client permissions needed
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages" // User permissions needed
    },
    run: async (client, interaction, config, db) => {
        await interaction.deferReply({ ephemeral: true });

        var user = interaction.options.get('user')?.value;
        const result = schema.validate({
                    user:user
                })
        console.warn('find: user: ' + result.value.user);
        if(result.error != undefined)
        {
            return interaction.editReply({ ephemeral: true, content: result.error.message, failIfNotExists: false});
        }
        let query;
        if (/^[0-9A-F]+$/.test(result.value.user)) query = "xuid=" + result.value.user;
        else query = "name=" + result.value.user;
        console.warn('find: query: ' + query);
        let response = await fetch(config.Client.webfronturl + '/api/client/find??count=50&' + query)
            .catch(() => { console.log('\x1b[31mWarning: ' + config.Client.webfronturl + ' not reachable\x1b[0m') });
        console.warn('find: response: ' + response.status);
        if (!response) return interaction.editReply({ ephemeral: true, content: "Cannot establish connection to <" + config.Client.webfronturl + ">" });
        if (response.status === 400) return interaction.editReply({ephemeral: true, content: "The length of 'Name' must be at least 3 characters"});

        let data = await response.json();
        if (data.totalFoundClients === 0) return interaction.editReply({ ephemeral: true, content: "No players found with provided " + (/^[0-9A-F]+$/.test(result.value.user) ? 'xuid' : 'name') });

        let arr = data.clients.map(obj => { return { Name: obj.name.replace(/\^[0-9:;c]/g, ''), ClientId: obj.clientId, XUID: obj.xuid } });
        let tad = stringtable.create(arr);

        const fnd = new EmbedBuilder()
            .setTitle('Client Search Results')
            .setColor(config.Client.color)
            .setDescription(`\`\`\`${tad}\`\`\``);
        interaction.editReply({ embeds: [fnd], ephemeral: true });
    },

};