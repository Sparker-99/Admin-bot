const { sendServerStatus } = require('../include/botutils');
exports.run = async (client, message, args) => {
    if (isNaN(args[0]) || args[0] < 1) return message.channel.send('```css\nKindly enter the server number from status cmd```');
    sendServerStatus(client, message.channel, args[0] - 1)
};

exports.conf = {
    aliases: ['sinfo']
};