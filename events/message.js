module.exports = (client, message) => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (message.content.indexOf(client.config.prefix) !== 0) return;
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.conf.aliases && cmd.conf.aliases.includes(command));
  if (!cmd) return;
  cmd.run(client, message, args);
};