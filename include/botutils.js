const { MessageEmbed } = require("discord.js");
const dbutils = require("./dbutils");
module.exports = {
  sendServerStatus: async function (client, channel, id) {
    let infos = await client.function.fetchinfo(client.config.admin_id);

    // No server data retrieved for Master server
    if (!infos)
      return channel.send(
        "```css\nInstance with the provided admin id is not found```"
      );
    let sername = infos[0];

    // Command was used and server ID was passed
    if (id >= 0) {
      if (!sername[id])
        return channel.send(
          "```css\nInstance with the provided server number is not found use status to get all avaiable numbers```"
        );
      channel.send(module.exports.buildInfoEmbed(client, infos, id));
      return;
    }

    // Retrieve embedChannel from channelId
    let statusChannel = client.channels.cache.get(client.config.status_channel);

    if (!statusChannel) return; // No channel found
    if (!Array.isArray(sername)) return; // No servers found

    // send status embed for each server
    sername.forEach((server, index) => {
      let embed = module.exports.buildInfoEmbed(client, infos, index);
      let prevId = dbutils.getMessageId(index);

      // previous message found
      if (prevId) {
        statusChannel.messages.fetch(prevId).then((msg) => msg.edit(embed));
      } else {
        // send a new embed and save messageID to collection
        statusChannel.send(embed).then((sentMsg) => {
          dbutils.addMessageId(index, sentMsg.id);
        });
      }
    });
  },

  buildInfoEmbed: function (client, infos, inp) {
    let sername = infos[0];
    let data = client.function.getinfo(
      infos[6][inp],
      infos[5][inp],
      infos[4][inp]
    );

    let msg = new MessageEmbed()
      .setTitle("Serverinfo")
      .setColor(client.color)
      .setThumbnail(client.thumbnail)
      .addField("Hostname", sername[inp].replace(/[0-9]+\. /g, "🔹 "), false)
      .addField("Online Players", infos[1][inp], true)
      .addField("Total Players", infos[2][inp], true)
      .addField("Map", client.function.getmap(infos[3][inp]), false)
      .addField("Gametype", infos[4][inp], true)
      .addField("Client", data[0], true)
      .addField(
        "\u200b",
        "[Direct Connect](https://applauncher.herokuapp.com/redirect?url=" +
          data[1] +
          ")",
        false
      )
      .setFooter("ID: " + infos[5][inp].replace(/[^0-9]/g, ""));

    return msg;
  },
};
