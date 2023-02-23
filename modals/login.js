const { EmbedBuilder } = require("discord.js");

module.exports = {
    id: "login",
    run: async (client, interaction, config, db) => {

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Login Submitted')
            ],
            ephemeral: true
        });

    },
};