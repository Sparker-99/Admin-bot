const os = require('os');
const childProcess = require('child_process');
const { MessageEmbed } = require('discord.js');
exports.run = async (client, message) => {
    let delay = ms => new Promise(res => setTimeout(res, ms));

    function exec(command) {
        const output = childProcess.execSync(command, { encoding: 'utf8' })
        return output
    }

    function cpuaverage() {
        var totalIdle = 0, totalTick = 0;
        var cpus = os.cpus();
        for (var i = 0, len = cpus.length; i < len; i++) {
            var cpu = cpus[i];
            for (type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        }
        return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
    }

    function avgClkGHz() {
        var cpus = os.cpus();
        var totalHz = 0;
        for (var i = 0; i < cpus.length; i++) {
            totalHz += cpus[i].speed;
        }
        var avgHz = totalHz / cpus.length;
        return avgHz / 1000;
    }

    let amount;
    const platform = process.platform;

    if (platform === 'linux') {
        const output = exec('lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l');
        amount = parseInt(output.trim(), 10);
    } else if (platform === 'darwin') {
        const output = exec('sysctl -n hw.physicalcpu_max');
        amount = parseInt(output.trim(), 10);
    } else if (platform === 'win32') {
        const output = exec('WMIC CPU Get NumberOfCores');
        amount = output.split(os.EOL)
            .map(function parse(line) { return parseInt(line) })
            .filter(function numbers(value) { return !isNaN(value) })
            .reduce(function add(sum, number) { return sum + number }, 0);
    } else {
        const cores = os.cpus().filter(function (cpu, index) {
            const hasHyperthreading = cpu.model.includes('Intel');
            const isOdd = index % 2 === 1;
            return !hasHyperthreading || isOdd
        });
        amount = cores.length;
    }

    async function msg() {
        var startMeasure = cpuaverage();
        await delay(100);
        var endMeasure = cpuaverage();
        var percentagecpu = 100 - ~~(100 * (endMeasure.idle - startMeasure.idle) / (endMeasure.total - startMeasure.total));

        let emb = new MessageEmbed()
            .setTitle("Bot Info")
            .setColor(client.color)
            .setThumbnail(client.thumbnail)
            .addField("Mem usage [" + Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) + "%]", ((((os.totalmem() - os.freemem()) / 1024) / 1024) / 1024).toFixed(2) + " GB / " + (((os.totalmem() / 1024) / 1024) / 1024).toFixed(2) + " GB", true)
            .addField("Cpu usage [" + percentagecpu + "%]", (avgClkGHz()).toFixed(1) + " Ghz | " + amount + (amount === 1 ? " Core" : " Cores"), true)
            .addField("\u200b", "\u200b", true)
            .addField("Bot's mem usage [" + ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(2) + "%]", (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB / " + (((os.totalmem() / 1024) / 1024) / 1024).toFixed(2) + " GB", true)
            .addField("Node version", process.versions.node, true)
            .addField("\u200b", "\u200b", true)
            .addField("Platform", process.platform.replace(/win32/g, "Windows"), true)
            .addField("Architecture", os.arch(), true)
            .addField("\u200b", "\u200b", true)
            .addField("Bot's Uptime", client.function.timeformat(client.uptime / 1000), false)
            .setFooter({ text: client.footer })
        message.channel.send({ embeds: [emb] });
    }

    if (client.config.ownerid)
        if (message.author.id === client.config.ownerid) msg();
        else message.channel.send('```css\nThis command is locked for owner```');
    else msg();
};

exports.conf = {
    aliases: ['binfo'],
    permissions: ['SEND_MESSAGES', 'EMBED_LINKS']
};