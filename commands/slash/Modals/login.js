const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const fetch = require('node-fetch');
const joi = require('joi');
const dbutils = require('../../../include/dbutils');
const schema = joi.object({
    username: joi.string()
        .alphanum()
        .min(1)
        .max(16)
        .required(),
    password: joi.string()
        .pattern(new RegExp('^[A-Za-z0-9!@#$%^&*_+=,.<>\/?-]{4,32}$'))
        .min(4)
        .max(32)
        .required()
        .messages({
            "string.pattern.base": `Password should be between 4 to 32 characters and contain letters, numbers or the following special characters !@#$%^&*_+=,.<>/?-`,
            "string.empty": `Password cannot be empty`,
            "any.required": `Password is required`,
          }),

})
module.exports = {
    name: "login",
    description: "!rt in game, or request token on webfront to get login info",
    type: 1,
    options: [],
    permissions: {
        DEFAULT_MEMBER_PERMISSIONS: "SendMessages"
    },
    run: async (client, interaction, config, db) => {
        const modal = new ModalBuilder()
            .setCustomId('login')
            .setTitle('Login');

        const clientid = new TextInputBuilder()
            .setCustomId('clientid')
            .setLabel("Client ID")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('example: 1234')
            .setMaxLength(10)
            .setMinLength(1)
            .setRequired(true);

        const password = new TextInputBuilder()
            .setCustomId('pass')
            .setLabel("Password/Token")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('example: aB12')
            .setMaxLength(32)
            .setMinLength(4)
            .setRequired(true);
        const ActionRow = new ActionRowBuilder().addComponents(clientid);
        const ActionRow2 = new ActionRowBuilder().addComponents(password);

        modal.addComponents(ActionRow, ActionRow2);
        await interaction.showModal(modal);
        let cid;
        let pass;
        const filter = (interaction) => interaction.customId === 'login';
        interaction.awaitModalSubmit({ filter, time: 300_000 })
            .then(async (interaction) => {
                console.log(`${interaction.customId} was submitted!`);

                const cid = interaction.fields.getTextInputValue('clientid');
                const pass = interaction.fields.getTextInputValue('pass');
                const result = schema.validate({
                    username:cid,
                    password:pass
                })
                if(result.error != undefined)
                {
                    return interaction.reply({ ephemeral: true, content: result.error.message, failIfNotExists: false});
                }
                if (isNaN(parseInt(result.value.username))) return interaction.reply({ ephemeral: true, content: "Incorrect login details provided. Client id must be a number. Login create cancelled", failIfNotExists: false});
                const response = await fetch(config.Client.webfronturl + '/api/client/' + parseInt(result.value.username) + '/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: `{"password":"` + result.value.password + `"}` })
                    .catch(() => { console.log('\x1b[31mWarning: ' + config.Client.webfronturl + ' not reachable\x1b[0m') });

                if (!response) return interaction.reply({ ephemeral: true, content: "Cannot establish connection to <" + config.Client.webfronturl + ">" , failIfNotExists: false});
                if (!(response.status == 200)) return interaction.reply({ ephemeral: true, content: "Incorrect login details provided. Login create cancelled", failIfNotExists: false });

                var value = response.headers.get('set-cookie').split(';').findIndex(element => element.includes(".AspNetCore.Cookies"));
                dbutils.insertData(interaction.member.id, parseInt(result.value.username), response.headers.get('set-cookie').split(';')[value]);

                interaction.reply({ ephemeral: true, content: "Success! your login is successfully stored.\nNote: We do not know or store your id and password", failIfNotExists: false});

            })
            .catch(console.error);


    },
};
