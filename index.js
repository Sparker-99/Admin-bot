const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

if (!fs.existsSync("./config.json")) {
  console.log("config.json not found");
  process.exit();
}

client.config = require("./config.json");
client.function = require("./include/functions");

client.function.configcheck(client);

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
  });
});

client.login(client.config.token);