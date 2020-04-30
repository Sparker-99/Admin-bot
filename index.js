const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const client = new Discord.Client();
const config = require("./config.json");
client.config = config;
if (!config.token) {
  console.log('\033[31m No token detected in config file\n\033[33m exiting....\x1b[37m')
  process.exit()
}
if (!config.prefix) {
  console.log('\033[31m No prefix detected in config file\n\033[33m exiting....\x1b[37m')
  process.exit()
}
if (!config.adminid) {
  console.log('\033[31m No adminid detected in config file\n\033[33m exiting....\x1b[37m')
  process.exit()
}
if (config.colour) {
  client.color = '#' + config.colour.replace(/#/gi, '');
} else {
  client.color = '#007acc';
}
client.on("ready", () => {
  console.log('\033[32m Bot is online with id \033[31m' + client.user.id);
  client.user.setPresence({
    game: {
      name: client.users.size + ' users | '+ config.prefix + 'help',
      type: 'watching'
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