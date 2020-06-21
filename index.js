const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");

const client = new Discord.Client();
const config = require("./config.json");
client.config = config;
if (!config.token) {
  console.log('No token detected in config file\nexiting....')
  process.exit()
}
if (!config.prefix) {
  console.log('No prefix detected in config file\nexiting....')
  process.exit()
}
if (!config.adminid) {
  console.log('No adminid detected in config file\nexiting....')
  process.exit()
}
if (config.colour) {
  client.color = '#' + config.colour.replace(/#/gi, '');
} else {
  client.color = '#007acc';
}
client.on("ready", () => {
  console.log('Bot is online with id ' + client.user.id);
  client.user.setPresence({ 
    activity: { 
      name: client.users.cache.size + ' users | '+ config.prefix + 'help',
      type: 'WATCHING'
    },
    status: 'online'
  })
});
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});
client.commands = new Enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
  });
});

client.login(config.token);