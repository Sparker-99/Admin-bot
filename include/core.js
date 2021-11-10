const fetch = require('node-fetch');
module.exports = {
    async configcheck(client) {
        if (!client.config.token) {
            console.log('No token detected in config file\nexiting....');
            process.exit();
        }
        if (!client.config.prefix) {
            console.log('No prefix detected in config file\nexiting....');
            process.exit();
        }
        if (!client.config.admin_id) {
            console.log('No adminid detected in config file\nexiting....');
            process.exit();
        }
        if (!client.config.webfronturl || !(/(http(s?)):\/\//i.test(client.config.webfronturl))) {
            console.log('No valid webfront url detected in config file\nexiting....');
            process.exit();
        }
        if (!(client.config.results_perpage > 0) || !(client.config.results_perpage < 11)) {
            console.log('Results per page must be between 1 to 10\nexiting....');
            process.exit();
        }
        if (client.config.ownerid && isNaN(client.config.ownerid)) {
            console.log('Owner id must be a number\nexiting....');
            process.exit();
        }
        if (client.config.webfronturl.slice(client.config.webfronturl.length - 1) === '/') {
            client.config.webfronturl = client.config.webfronturl.slice(0, -1);
        }
        if (!client.config.custom_presence) {
            client.config.custom_presence = client.config.prefix + 'help';
        }
        if (client.config.status_channel_id && isNaN(client.config.status_channel_id)) {
            console.log('Channel id must be a number\nexiting....');
            process.exit();
        }
        if (client.config.statchan_update_interval && (isNaN(client.config.statchan_update_interval) || client.config.statchan_update_interval < 60)) {
            console.log('Status channel update interval must be at least 60 seconds or more\nexiting....');
            process.exit();
        }
        if (client.config.color) {
            client.color = '#' + client.config.color.replace(/#/gi, '');
        } else
            client.color = '#007acc';

        if (client.config.thumbnail_image_url) {
            client.thumbnail = client.config.thumbnail_image_url;
        } else
            client.thumbnail = 'https://i.gyazo.com/898c573e108fe755661265fc27ee7335.png';

        if (client.config.footer) {
            client.footer = client.config.footer;
        } else
            client.footer = 'Admin Bot version ' + require('../package.json').version;
    },

    timeformat(uptime) {
        var days = Math.floor((uptime % 31536000) / 86400);
        var hours = Math.floor((uptime % 86400) / 3600);
        var minutes = Math.floor((uptime % 3600) / 60);
        var seconds = Math.round(uptime % 60);
        return (days > 0 ? days + " days, " : "") + (hours > 0 ? hours + " hours, " : "") + (minutes > 0 ? minutes + " minutes, " : "") + (seconds > 0 ? seconds + " seconds" : "");
    },

    async fetchinfo(id) {
        let response = await fetch('http://api.raidmax.org:5000/instance/' + id)
            .then((res) => res.json())
            .catch(() => { console.log('\x1b[31mWarning: Masterserver not reachable\x1b[0m') });
        if (response && response.servers) {
            let hostnames = [];
            let players = [];
            let maxplayers = [];
            let gamemap = [];
            let gametype = [];
            let serid = [];
            let serip = [];
            let gameparser = [];
            let gamename = [];
            var total = response.servers.length;
            for (i = 0; i < total; i++) {
                if (response.servers[i]) {
                    hostnames[i] = (i + 1) + '. ' + response.servers[i].hostname.replace(/\^[0-9:;c]/g, '');
                    players[i] = response.servers[i].clientnum;
                    maxplayers[i] = response.servers[i].maxclientnum;
                    gamemap[i] = response.servers[i].map;
                    gametype[i] = response.servers[i].gametype;
                    serid[i] = response.servers[i].id;
                    serip[i] = response.servers[i].ip + ':' + response.servers[i].port;
                    gameparser[i] = response.servers[i].version;
                    gamename[i] = response.servers[i].game
                }
            }
            return [hostnames, players, maxplayers, gamemap, gametype, serid, serip, gameparser, gamename];
        } else {
            return false;
        }
    },

    async execute(url, id, cookie, cmd) {
        let response = await fetch(url + '/api/server/' + id + '/execute', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': cookie }, body: `{"command":"` + cmd + `"}` })
            .catch(() => { console.log('\x1b[31mWarning: ' + url + ' not reachable\x1b[0m') });

        if (!response) return [404, 'Not Reachable'];
        if (response.status === 401) return [401, 'Unauthorized'];
        if (response.status === 400) return [400, await response.text()];

        let data = await response.json();

        if (data.output.length !== 0) {
            let answers = [];
            var total = data.output.length;
            for (i = 0; i < total; i++) {
                if (data.output[i]) {
                    answers[i] = data.output[i];
                }
            }
            return [response.status, data.executionTimeMs, answers];
        }
        return [response.status, data.executionTimeMs, 'Command Executed Successfully'];
    },

    async fetchplayers(url, sid) {
        let response = await fetch(url + '/api/status')
            .then((res) => res.json())
            .catch(() => { console.log('\x1b[31mWarning: ' + url + ' not reachable\x1b[0m') });

        if (!response || !response.length) return 404;
        let server = response.find(({ id }) => id == sid);

        if (!server) return 400;
        let serverinfo = [server.id, server.name.replace(/\^[0-9:;c]/g, '')];

        if (!server.players.length) return [false, serverinfo];
        let playerinfo = server.players.map(el => { return [el.level.replace(/Creator/g, "Lord").replace(/SeniorAdmin/g, "S.Admin").replace(/Administrator/g, "Admin").replace(/Moderator/g, "Mod").replace(/Trusted/g, "Trust").replace(/Flagged/g, "Flag"), (el.name.replace(/\^[0-9:;c]/g, '').length > 13) ? el.name.replace(/\^[0-9:;c]/g, '').slice(0, 13) + '..' : el.name.replace(/\^[0-9:;c]/g, ''), el.score, el.ping] });

        return [playerinfo, serverinfo];
    },

    getinfo(gamever, ip, type) {
        let gameclient, dc;
        switch (gamever) {
            case "CoD4 X - win_mingw-x86 build 1056 Dec 12 2020":
                gameclient = "COD 4X";
                dc = "cod4://" + ip;
                break;
            case "Plutonium T4":
                gameclient = "Plutonium T4";
                dc = "plutonium://play/t4mp/" + ip;
                break;
            case "IW4x (v0.6.0)":
                gameclient = "IW4X";
                dc = "iw4x://" + ip;
                break;
            case "Call of Duty Multiplayer - Ship COD_T5_S MP build 7.0.189 CL(1022875) CODPCAB-V64 CEG Wed Nov 02 18:02:23 2011 win-x86":
                gameclient = "Rekt T5M";
                dc = "t5://" + ip;
                break;
            case "IW5 MP 1.4 build 382 latest Thu Jan 19 2012 11:09:49AM win-x86":
                gameclient = "Tekno MW3";
                dc = "cod://" + ip;
                break;
            case "IW5 MP 1.9 build 388110 Fri Sep 14 00:04:28 2012 win-x86":
                gameclient = "Plutonium IW5";
                dc = "plutonium://play/iw5mp/" + ip;
                break;
            case "Call of Duty Multiplayer - Ship COD_T6_S MP build 1.0.44 CL(1759941) CODPCAB2 CEG Fri May 9 19:19:19 2014 win-x86 813e66d5":
                gameclient = "Plutonium T6";
                if (type !== 'zstandard' && type !== 'zclassic' && type !== 'zgrief') dc = "plutonium://play/t6mp/" + ip;
                else dc = "plutonium://play/t6zm/" + ip;
                break;
            case "IW6 MP 3.15 build 2 Sat Sep 14 2013 03:58:30PM win64":
                gameclient = "IW6X";
                dc = "iw6x://" + ip;
                break;
            case "S1 MP 1.22 build 2195988 Wed Apr 18 11:26:14 2018 win64":
                gameclient = "S1X";
                dc = "s1x://" + ip;
                break;
            case "[local] ship win64 CODBUILD8-764 (3421987) Mon Dec 16 10:44:20 2019 10d27bef":
                gameclient = "Black Ops 3";
                dc = "cod://" + ip;
                break;
            case "CSGO":
                gameclient = "CS:GO";
                dc = "steam://connect/" + ip;
                break;
            case "CSGOSM":
                gameclient = "CS:GO";
                dc = "steam://connect/" + ip;
                break;
            default:
                gameclient = "Unknown";
                dc = "cod://" + ip;
        }
        return [gameclient, dc];
    },

    getgame(cname) {
        let nm, authurl;
        switch (cname) {
            case "IW3":
                nm = "Modern Warfare";
                authurl = "http://orig05.deviantart.net/8749/f/2008/055/0/c/call_of_duty_4__dock_icon_by_watts240.png";
                break;
            case "IW4":
                nm = "Modern Warfare 2";
                authurl = "https://i.gyazo.com/758b6933287392106bfdddc24b09d502.png";
                break;
            case "IW5":
                nm = "Modern Warfare 3";
                authurl = "https://orig00.deviantart.net/9af1/f/2011/310/2/1/modern_warfare_3_logo_by_wifsimster-d4f9ozd.png";
                break;
            case "IW6":
                nm = "Ghosts";
                authurl = "https://i.gyazo.com/82b84341e141f6420db6c6ef1d9037bb.png";
                break;
            case "T4":
                nm = "World at War";
                authurl = "https://i.gyazo.com/1e1987d84038aae38610cab9c999868d.png";
                break;
            case "T5":
                nm = "Black Ops";
                authurl = "https://i.gyazo.com/a8a22764fafd4cc178329717b9bb35dd.png";
                break;
            case "T6":
                nm = "Black Ops 2";
                authurl = "https://i.gyazo.com/5a445c5c733c698b32732550ec797e91.png";
                break;
            case "T7":
                nm = "Black Ops 3";
                authurl = "https://i.gyazo.com/5691ca84d47e219cdec76901ff142159.png";
                break;
            case "SHG1":
                nm = "Advanced Warfare";
                authurl = "https://i.gyazo.com/d524bf93e1fc38fa46f8fe1ed5162493.png";
                break;
            case "CSGO":
                nm = "Counter-Strike: Global Offensive";
                authurl = "https://static.wikia.nocookie.net/cswikia/images/8/8f/Game_icon_730.png";
                break;
            case "CSGOSM":
                nm = "Counter-Strike: Global Offensive";
                authurl = "https://static.wikia.nocookie.net/cswikia/images/8/8f/Game_icon_730.png";
                break;
            default:
                nm = cname;
                authurl = "ukn"
        }
        return [nm, authurl];
    },

    getmode(type, gname) {
        let mode;
        switch (type) {
            case "aliens":
                mode = "Extinction"
                break;
            case "arena":
                mode = "Arena"
                break;
            case "ball":
                mode = "Uplink"
                break;
            case "blitz":
                mode = "Blitz"
                break;
            case "conf":
                mode = "Kill Confirmed"
                break;
            case "cranked":
                mode = "Cranked"
                break;
            case "ctf":
                mode = "Capture The Flag"
                break;
            case "dd":
                mode = "Demolition"
                break;
            case "dem":
                mode = "Demolition"
                break;
            case "dm":
                mode = "Free For All"
                break;
            case "dom":
                mode = "Domination"
                break;
            case "grind":
                mode = "Grind"
                break;
            case "grnd":
                mode = "Drop Zone"
                break;
            case "gtnw":
                mode = "Global Thermo-Nuclear War"
                break;
            case "gun":
                mode = "Gun Game"
                break;
            case "hp":
                mode = "Hardpoint"
                break;
            case "hq":
                mode = "Headquaters"
                break;
            case "cj":
                mode = "Cod Jumper"
                break;
            case "horde":
                mode = "Safeguard"
                break;
            case "infect":
                mode = "Infected"
                break;
            case "jugg":
                mode = "Juggernaut"
                break;
            case "koth":
                if (gname == 'T6') mode = "Hardpoint";
                else mode = "Headquarters";
                break;
            case "oic":
                mode = "One In The Chamber"
                break;
            case "oneflag":
                mode = "One-Flag CTF"
                break;
            case "sab":
                mode = "Sabotage"
                break;
            case "sas":
                mode = "Sticks & Stones"
                break;
            case "sd":
                mode = "Search and Destroy"
                break;
            case "shrp":
                mode = "Sharpshooter"
                break;
            case "siege":
                mode = "Reinforce"
                break;
            case "sotf":
                mode = "Hunted"
                break;
            case "sotf_ffa":
                mode = "Hunted FFA"
                break;
            case "sr":
                mode = "Search and Rescue"
                break;
            case "tdef":
                mode = "Team Defender"
                break;
            case "tdm":
                mode = "Team Deathmatch"
                break;
            case "tjugg":
                mode = "Team Juggernaut"
                break;
            case "twar":
                if (gname == 'SHG1') mode = "Momentum";
                else mode = "War";
                break;
            case "war":
                mode = "Team Deathmatch"
                break;
            case "zombies":
                mode = "Exo Zombies"
                break;
            case "horde":
                mode = "Exo Survival"
                break;
            case "zclassic":
                mode = "Tranzit"
                break;
            case "zcleansed":
                mode = "Turned"
                break;
            case "zstandard":
                mode = "Survival"
                break;
            case "zgrief":
                mode = "Grief"
                break;
            case "qczm":
                mode = "Quarantine Chaos Zombies"
                break;
            case "deathrun":
                mode = "DeathRun/Freerun"
                break;
            case "slasher":
                mode = "Mike Myers"
                break;
            default:
                mode = type;
        }
        return [mode];
    },

    getmap(console, gname) {
        let alias, map;
        if (gname == "IW3") {
            switch (console) {
                case "mp_convoy":
                    alias = "Ambush";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/3c/Bare_Load_Screen_Ambush_CoD4.jpg/revision/latest?cb=20100723075603";
                    break;
                case "mp_backlot":
                    alias = "Backlot"
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/0f/Backlot_loadscreen_CoD4.jpg/revision/latest?cb=20100723075613";
                    break;
                case "mp_bloc":
                    alias = "Bloc";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9d/Bare_Load_Screen_Bloc_CoD4.jpg/revision/latest?cb=20100723075638";
                    break;
                case "mp_bog":
                    alias = "Bog";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Bog_Map_Image_CoD4.jpg/revision/latest?cb=20100723075648";
                    break;
                case "mp_countdown":
                    alias = "Countdown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e9/Bare_Load_Screen_Countdown_CoD4.jpg/revision/latest?cb=20100723075829";
                    break;
                case "mp_crash":
                    alias = "Crash";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640400-Bare-Load-Screen-Crash-CoD4.jpg";
                    break;
                case "mp_crossfire":
                    alias = "Crossfire";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Cod4-map-crossfire.jpg";
                    break;
                case "mp_citystreets":
                    alias = "District";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Cod4-map-district.jpg";
                    break;
                case "mp_farm":
                    alias = "Downpour";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640400-Bare-Load-Screen-Downpour-CoD4.jpg";
                    break;
                case "mp_overgrown":
                    alias = "Overgrown";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640400-Bare-Load-Screen-Overgrown-CoD4.jpg";
                    break;
                case "mp_pipeline":
                    alias = "Pipeline";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Cod4-map-pipeline.jpg";
                    break;
                case "mp_shipment":
                    alias = "Shipment";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Shipment-Load.jpg";
                    break;
                case "mp_showdown":
                    alias = "Showdown";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Showdown-MWR.jpg";
                    break;
                case "mp_strike":
                    alias = "Strike";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640400-Cod4-map-strike.jpg";
                    break;
                case "mp_vacant":
                    alias = "Vacant";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640360-Cod4-map-vacant.jpg";
                    break;
                case "mp_cargoship":
                    alias = "Wet Work";
                    map = "https://www.gamegrin.com/assets/Uploads/_resampled/resizedimage640400-Cod4-map-wetwork.jpg";
                    break;
                case "mp_crash_snow":
                    alias = "Winter Crash";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f7/Bare_Load_Screen_Winter_Crash_CoD4.jpg/revision/latest?cb=20100723080720";
                    break;
                case "mp_broadcast":
                    alias = "Broadcast";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ec/Broadcast_loading_screen_CoD4.jpg/revision/latest?cb=20100723080927";
                    break;
                case "mp_creek":
                    alias = "Creek";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e1/CreekCOD4.jpg/revision/latest?cb=20100723075941";
                    break;
                case "mp_carentan":
                    alias = "Chinatown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/0c/ChinatownCOD4.jpg/revision/latest?cb=20110727174233";
                    break;
                case "mp_killhouse":
                    alias = "Killhouse";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/48/Cod4-killhouse.jpg/revision/latest?cb=20100723081127";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "IW4") {
            switch (console) {
                case "mp_rust":
                    alias = "Rust";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/33/Rust.jpg/revision/latest?cb=20100720174413";
                    break;
                case "mp_terminal":
                    alias = "Terminal";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/14/Bare_Load_Screen_Terminal_MW2.jpg/revision/latest?cb=20100720174519";
                    break;
                case "mp_crash":
                    alias = "Crash";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9f/Bare_Load_Screen_Crash_MW2.jpg/revision/latest?cb=20100613115705";
                    break;
                case "mp_afghan":
                    alias = "Afghan";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/83/Afghan_loading_screen_MW2.png/revision/latest?cb=20130310131229";
                    break;
                case "mp_derail":
                    alias = "Derail";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/20/Derail.jpg/revision/latest?cb=20100720174408";
                    break;
                case "mp_estate":
                    alias = "Estate";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/91/Estate.jpg/revision/latest?cb=20100720174409";
                    break;
                case "mp_favela":
                    alias = "Favela";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Favela_Map_MW2.jpg/revision/latest?cb=20100720174410";
                    break;
                case "mp_highrise":
                    alias = "Highrise";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/49/Highrise-promo.jpg/revision/latest?cb=20100720174411";
                    break;
                case "mp_invasion":
                    alias = "Invasion";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/95/Invasion_MW2.jpg/revision/latest?cb=20100720174410";
                    break;
                case "mp_checkpoint":
                    alias = "Karachi";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9f/Karachi-prev.jpg/revision/latest?cb=20100720174412";
                    break;
                case "mp_quarry":
                    alias = "Quarry";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/8a/Loadscreen_mp_quarry.jpg/revision/latest?cb=20091207173135";
                    break;
                case "mp_rundown":
                    alias = "Rundown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/3a/Rundown-prev.jpg/revision/latest?cb=20100720174412";
                    break;
                case "mp_boneyard":
                    alias = "Scrapyard";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ef/Scrapyard.jpg/revision/latest?cb=20100720174413";
                    break;
                case "mp_nightshift":
                    alias = "Skidrow";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d2/Skidrow.jpg/revision/latest?cb=20100720174516";
                    break;
                case "mp_subbase":
                    alias = "Sub Base";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/1e/Sub_Base.jpg/revision/latest?cb=20100720174517";
                    break;
                case "mp_underpass":
                    alias = "Underpass";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b5/Underpass.jpg/revision/latest?cb=20100720174519";
                    break;
                case "mp_brecourt":
                    alias = "Wasteland";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/cc/Wasteland.jpg/revision/latest?cb=20100720174520";
                    break;
                case "mp_overgrown":
                    alias = "Overgrown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/7d/Bare_Load_Screen_Overgrown_CoD4.jpg/revision/latest?cb=20110727174104";
                    break;
                case "mp_strike":
                    alias = "Strike";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b0/Loadscreen_mp_strike.jpg/revision/latest?cb=20100712195725";
                    break;
                case "mp_vacant":
                    alias = "Vacant";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/67/Loadscreen_mp_vacant.jpg/revision/latest?cb=20100712195617";
                    break;
                case "mp_abandon":
                    alias = "Carnival";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c3/Carnival_loadscreen.jpg/revision/latest?cb=20100712195429";
                    break;
                case "mp_trailerpark":
                    alias = "Trailer Park";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/cf/Trailer_Park.jpg/revision/latest?cb=20100712195448";
                    break;
                case "mp_fuel2":
                    alias = "Fuel";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/de/Fuel_loadscreen.jpg/revision/latest?cb=20100712195521";
                    break;
                case "mp_storm":
                    alias = "Storm";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/60/MW2_Storm.jpg/revision/latest?cb=20100613115722";
                    break;
                case "mp_complex":
                    alias = "Bailout";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/0e/MW2_Bailout.jpg/revision/latest?cb=20100613115812";
                    break;
                case "mp_compact":
                    alias = "Salvage";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d7/MW2_Salvage.jpg/revision/latest?cb=20100613115824";
                    break;
                case "mp_nuked":
                    alias = "Nuketown";
                    map = "https://i.ytimg.com/vi/ysr0CyyJx8E/maxresdefault.jpg";
                    break;
                case "iw4_credits":
                    alias = "Test map";
                    map = "https://i.ytimg.com/vi/VniF3DnE5uk/maxresdefault.jpg";
                    break;
                case "mp_killhouse":
                    alias = "Killhouse";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/48/Cod4-killhouse.jpg/revision/latest?cb=20100723081127";
                    break;
                case "mp_bog_sh":
                    alias = "Bog";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Bog_Map_Image_CoD4.jpg/revision/latest?cb=20100723075648";
                    break;
                case "mp_cargoship_sh":
                    alias = "Freighter";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d4/Cargo_loadscreen_BOII.png/revision/latest?cb=20130120072815";
                    break;
                case "mp_cargoship":
                    alias = "Cargoship";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d4/Cargo_loadscreen_BOII.png/revision/latest?cb=20130120072815";
                    break;
                case "mp_shipment":
                    alias = "Shipment";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9b/Shipment_Load.jpg/revision/latest?cb=20100723080524";
                    break;
                case "mp_shipment_long":
                    alias = "Shipment - Long";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9b/Shipment_Load.jpg/revision/latest?cb=20100723080524";
                    break;
                case "mp_rust_long":
                    alias = "Rust - Long";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/33/Rust.jpg/revision/latest?cb=20100720174413";
                    break;
                case "mp_firingrange":
                    alias = "Firing Range";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/82/Bare_Load_Screen_Firing_Range_BO.jpg/revision/latest?cb=20110303121918";
                    break;
                case "mp_storm_spring":
                    alias = "Chemical Plant";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/60/MW2_Storm.jpg/revision/latest?cb=20100613115722";
                    break;
                case "mp_fav_tropical":
                    alias = "Tropical Favela";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Favela_Map_MW2.jpg/revision/latest?cb=20100720174410";
                    break;
                case "mp_estate_tropical":
                    alias = "Tropical Estate";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/91/Estate.jpg/revision/latest?cb=20100720174409";
                    break;
                case "mp_crash_tropical":
                    alias = "Tropical Crash";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9f/Bare_Load_Screen_Crash_MW2.jpg/revision/latest?cb=20100613115705";
                    break;
                case "mp_bloc_sh":
                    alias = "Forgotten City";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9d/Bare_Load_Screen_Bloc_CoD4.jpg/revision/latest?cb=20100723075638";
                    break;
                case "mp_cross_fire":
                    alias = "Crossfire";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/53/Cod4_map_crossfire.jpg/revision/latest?cb=20100723075954";
                    break;
                case "mp_bloc":
                    alias = "Bloc";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9d/Bare_Load_Screen_Bloc_CoD4.jpg/revision/latest?cb=20100723075638";
                    break;
                case "oilrig":
                    alias = "Oilrig";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/30/Mg_oilrig.jpg/revision/latest?cb=20120716172859";
                    break;
                case "co_hunted":
                    alias = "Village";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f4/Bare_Load_Screen_Village_MW3.png/revision/latest?cb=20120320235505";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "IW5") {
            switch (console) {
                case "mp_seatown":
                    alias = "Seatown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a7/Bare_Load_Screen_Seatown_MW3.png/revision/latest?cb=20120320235504";
                    break;
                case "mp_alpha":
                    alias = "Lockdown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a6/Lockdown_loading_screen_MW3.PNG/revision/latest?cb=20130728192041";
                    break;
                case "mp_bravo":
                    alias = "Mission";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/20/Bare_Load_Screen_Mission_MW3.png/revision/latest?cb=20120320235416";
                    break;
                case "mp_carbon":
                    alias = "Carbon";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c8/Bare_Load_Screen_Carbon_MW3.png/revision/latest?cb=20120320235417";
                    break;
                case "mp_dome":
                    alias = "Dome";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f1/Bare_Load_Screen_Dome_MW3.png/revision/latest?cb=20120320235417";
                    break;
                case "mp_plaza2":
                    alias = "Arkaden";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/65/Bare_Loading_Screen_Arkaden_MW3.png/revision/latest?cb=20120519230749";
                    break;
                case "mp_exchange":
                    alias = "Downturn";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/52/Bare_Load_Screen_Downturn_MW3.png/revision/latest?cb=20120320235418";
                    break;
                case "mp_bootleg":
                    alias = "Bootleg";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/52/Bare_Load_Screen_Downturn_MW3.png/revision/latest?cb=20120320235418";
                    break;
                case "mp_hardhat":
                    alias = "Hardhat";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/5a/Bare_Load_Screen_Hardhat_MW3.png/revision/latest?cb=20120519225919";
                    break;
                case "mp_interchange":
                    alias = "Interchange";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4b/Bare_Load_Screen_Interchange_MW3.png/revision/latest?cb=20120320235418";
                    break;
                case "mp_lambeth":
                    alias = "Fallen";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d8/Bare_Loading_Screen_Fallen_MW3.png/revision/latest?cb=20120320235419";
                    break;
                case "mp_radar":
                    alias = "Outpost";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/3c/Bare_Load_Screen_Outpost_MW3.png/revision/latest?cb=20120320235504";
                    break;
                case "mp_mogadishu":
                    alias = "Bakaara";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/39/Bare_Load_Screen_Bakaara_MW3.png/revision/latest?cb=20120320235502";
                    break;
                case "mp_paris":
                    alias = "Resistance";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fe/Bare_Load_Screen_Resistance_MW3.png/revision/latest?cb=20120320235503";
                    break;
                case "mp_underground":
                    alias = "Underground";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/09/Bare_Load_Screen_Underground_MW3.png/revision/latest?cb=20120320235504";
                    break;
                case "mp_village":
                    alias = "Village";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f4/Bare_Load_Screen_Village_MW3.png/revision/latest?cb=20120320235505";
                    break;
                case "mp_aground_ss":
                    alias = "Aground";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/31/Sideview_Aground_MW3.jpg/revision/latest?cb=20120512095024";
                    break;
                case "mp_boardwalk":
                    alias = "Boardwalk";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2c/Boardwalk_loadscreen_MW3.png/revision/latest?cb=20140411094526";
                    break;
                case "mp_burn_ss":
                    alias = "U-turn";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d0/U-Turn_loadscreen_MW3.png/revision/latest?cb=20140411095015";
                    break;
                case "mp_cement":
                    alias = "Foundation";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/0f/Foundation_loadscreen_MW3.png/revision/latest?cb=20140411095546";
                    break;
                case "mp_courtyard_ss":
                    alias = "Erosion";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/46/Main_Statue_Erosion_MW3.jpg/revision/latest?cb=20120512094647";
                    break;
                case "mp_crosswalk_ss":
                    alias = "Intersection";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/dd/Intersection_loadscreen_MW3.png/revision/latest?cb=20140411100832";
                    break;
                case "mp_hillside_ss":
                    alias = "Getaway";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/1f/Bare_Load_Screen_Getaway_MW3.jpg/revision/latest?cb=20120512095322";
                    break;
                case "mp_italy":
                    alias = "Piazza";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/38/Bare_Load_Screen_Piazza_MW3.jpg/revision/latest?cb=20120110185200";
                    break;
                case "mp_meteora":
                    alias = "Sanctuary";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4b/Bare_Load_Screen_Sanctuary_MW3.jpg/revision/latest?cb=20120410173611";
                    break;
                case "mp_moab":
                    alias = "Gulch";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/30/Bridge_Gulch_MW3.jpg/revision/latest?cb=20120802172028";
                    break;
                case "mp_morningwood":
                    alias = "Black Box";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d1/Bare_Load_Screen_Black_Box_MW3.jpg/revision/latest?cb=20120309203305";
                    break;
                case "mp_nola":
                    alias = "Parish";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/aa/Missiles_Parish_MW3.jpg/revision/latest?cb=20120802172330";
                    break;
                case "mp_overwatch":
                    alias = "Overwatch";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/35/Bare_Load_Screen_Overwatch_MW3.jpg/revision/latest?cb=20120207181435";
                    break;
                case "mp_park":
                    alias = "Liberation";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e8/Bare_Load_Screen_Liberation_MW3.png/revision/latest?cb=20120120153252";
                    break;
                case "mp_qadeem":
                    alias = "Oasis";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c1/Bare_Load_Screen_Oasis_MW3.jpg/revision/latest?cb=20120512100009";
                    break;
                case "mp_restrepo_ss":
                    alias = "Lookout";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/28/Bare_Load_Screen_Lookout_MW3.jpg/revision/latest?cb=20120512095607";
                    break;
                case "mp_roughneck":
                    alias = "Off Shore";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2d/Crane_Off_Shore_MW3.jpg/revision/latest?cb=20120712172115";
                    break;
                case "mp_shipbreaker":
                    alias = "Decommission";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4f/Bare_ELITE_Calendar_Decommission_MW3.jpg/revision/latest?cb=20120802171643";
                    break;
                case "mp_six_ss":
                    alias = "Vortex";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2a/Bare_ELITE_Calendar_Vortex_MW3.jpg/revision/latest?cb=20120624135437";
                    break;
                case "mp_terminal_cls":
                    alias = "Terminal";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/68/Terminal_Loading_Screen_MW3.png/revision/latest?cb=20120826091508";
                    break;
                case "mp_rust":
                    alias = "Rust";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/33/Rust.jpg/revision/latest?cb=20100720174413";
                    break;
                case "mp_highrise":
                    alias = "Highrise";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/49/Highrise-promo.jpg/revision/latest?cb=20100720174411";
                    break;
                case "mp_nuked":
                    alias = "Nuketown";
                    map = "https://i.ytimg.com/vi/ysr0CyyJx8E/maxresdefault.jpg";
                    break;
                case "mp_nightshift":
                    alias = "Skidrow";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d2/Skidrow.jpg/revision/latest?cb=20100720174516";
                    break;
                case "mp_favela":
                    alias = "Favela";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Favela_Map_MW2.jpg/revision/latest?cb=20100720174410";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "IW6") {
            switch (console) {
                case "mp_prisonbreak":
                    alias = "Prision Break";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a6/Prison_Break_CoDG.jpg/revision/latest?cb=20160123214305";
                    break;
                case "mp_dart":
                    alias = "Octane";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/be/Octane_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222225028";
                    break;
                case "mp_lonestar":
                    alias = "Tremor";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/23/Tremor_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222233807";
                    break;
                case "mp_frag":
                    alias = "Freight";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e4/Freight_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222225820";
                    break;
                case "mp_snow":
                    alias = "Whiteout";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/90/Whiteout_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222234606";
                    break;
                case "mp_fahrenheit":
                    alias = "Stormfront";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/aa/Stormfront_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222233307";
                    break;
                case "mp_hashima":
                    alias = "Siege";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c3/Siege_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222231338";
                    break;
                case "mp_warhawk":
                    alias = "Warhawk";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/97/Warhawk_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222234210";
                    break;
                case "mp_sovereign":
                    alias = "Sovereign";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/de/Sovereign_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222231915";
                    break;
                case "mp_zebra":
                    alias = "Overload";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/86/Overlord_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222230253";
                    break;
                case "mp_skeleton":
                    alias = "Stonehaven";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b6/Stonehaven_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222232822";
                    break;
                case "mp_chasm":
                    alias = "Chasm";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fe/Chasm_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222201016";
                    break;
                case "mp_flooded":
                    alias = "Flooded";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/56/Flooded_Menu_Icon_CoDG.jpg/revision/latest?cb=20160222225348";
                    break;
                case "mp_strikezone":
                    alias = "Strikezone";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/02/Strikezone_Menu_Icon_CoDG.jpg/revision/latest?cb=20180514000159";
                    break;
                case "mp_descent_new":
                    alias = "Free Fall";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/21/Free_Fall_Loading_Screen_CoDG.jpg/revision/latest?cb=20160219035443";
                    break;
                case "mp_dome_ns":
                    alias = "Unearthed";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/83/Unearthed_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618191214";
                    break;
                case "mp_ca_impact":
                    alias = "Collision";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/77/Collision_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618190921";
                    break;
                case "mp_ca_behemoth":
                    alias = "Behemoth";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4d/Behemoth_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618190417";
                    break;
                case "mp_battery3":
                    alias = "Ruins";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/08/Ruins_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618185226";
                    break;
                case "mp_dig":
                    alias = "Pharaoh";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/94/Pharaoh_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618191459";
                    break;
                case "mp_favela_iw6":
                    alias = "Favela";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4b/Favela_Map_CoDG.jpg/revision/latest?cb=20150618192317";
                    break;
                case "mp_pirate":
                    alias = "Mutiny";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b3/Mutiny_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618192100";
                    break;
                case "mp_zulu":
                    alias = "Departed";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/14/Departed_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618191721";
                    break;
                case "mp_conflict":
                    alias = "Dynasty";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/cc/Dynasty_Menu_Icon_CoDG.jpg/revision/latest?cb=20160117004931";
                    break;
                case "mp_mine":
                    alias = "Goldrush";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9d/Goldrush_Nemesis_CoDG.jpg/revision/latest?cb=20160117231327";
                    break;
                case "mp_shipment_ns":
                    alias = "Showtime";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f5/Showtime_Menu_Icon_CoDG.png/revision/latest?cb=20160117030703";
                    break;
                case "mp_zerosub":
                    alias = "Subzero";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f2/Subzero_Nemesis_CoDG.jpg/revision/latest?cb=20160117230851";
                    break;
                case "mp_boneyard_ns":
                    alias = "Ignition";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/87/Ignition_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618184639";
                    break;
                case "mp_ca_red_river":
                    alias = "Containment";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/93/Containment_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618184139";
                    break;
                case "mp_ca_rumble":
                    alias = "Bayview";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2b/BayView_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618183749";
                    break;
                case "mp_swamp":
                    alias = "Fog";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/56/Fog_Loading_Screen_CoDG.jpg/revision/latest?cb=20150618183104";
                    break;
                case "mp_alien_town":
                    alias = "Point of Contact";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a9/Point_of_Contact_loading_screen_CoDG.png/revision/latest?cb=20140818190238";
                    break;
                case "mp_alien_armory":
                    alias = "Nightfall";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/3b/Nightfall_Screenshot_CoDG.jpg/revision/latest?cb=20170705221821";
                    break;
                case "mp_alien_beacon":
                    alias = "Mayday";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f2/Mayday_CoDG.jpg/revision/latest?cb=20160117211635";
                    break;
                case "mp_alien_dlc3":
                    alias = "Awakening";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/52/CoDG_Invasion_Extinction_Awakening_o.jpg/revision/latest?cb=20140605021520";
                    break;
                case "mp_alien_last":
                    alias = "Exodus";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/db/Exodus_CoDG.jpg/revision/latest?cb=20160117203311";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "T4") {
            switch (console) {
                case "mp_airfield":
                    alias = "Airfield";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/04/Airfield.jpg/revision/latest?cb=20100703083537";
                    break;
                case "mp_asylum":
                    alias = "Asylum";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/99/Asylum.jpg/revision/latest?cb=20100703075737";
                    break;
                case "mp_castle":
                    alias = "Castle";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e1/Castle.jpg/revision/latest?cb=20100703075702";
                    break;
                case "mp_shrine":
                    alias = "Cliffside";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b5/Cliffside.jpg/revision/latest?cb=20110702030241";
                    break;
                case "mp_courtyard":
                    alias = "Courtyard";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/30/Courtyard.jpg/revision/latest?cb=20100703075822";
                    break;
                case "mp_dome":
                    alias = "Dome";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/64/Dome.jpg/revision/latest?cb=20100703075919";
                    break;
                case "mp_downfall":
                    alias = "Downfall";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/03/Downfall_Loadscreen_WaW.png/revision/latest?cb=20121128143425";
                    break;
                case "mp_hangar":
                    alias = "Hanger";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/be/Hanger.jpg/revision/latest?cb=20100703080146";
                    break;
                case "mp_makin":
                    alias = "Makin";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fa/Makin.jpg/revision/latest?cb=20110710131317";
                    break;
                case "mp_outskirts":
                    alias = "Outskirts";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/44/Outskirts.jpg/revision/latest?cb=20100703080341";
                    break;
                case "mp_roundhouse":
                    alias = "Roundhouse";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/25/Roundhouse.jpg/revision/latest?cb=20100703080407";
                    break;
                case "mp_suburban":
                    alias = "Upheaval";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fb/Upheaval.jpg/revision/latest?cb=20100703081123";
                    break;
                case "mp_kneedeep":
                    alias = "Knee Deep";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d1/KneeDeepLoad.jpg/revision/latest?cb=20100703075448";
                    break;
                case "mp_nachtfeuer":
                    alias = "Nightfire";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/73/Nightfire.jpg/revision/latest?cb=20100703081308";
                    break;
                case "mp_subway":
                    alias = "Station";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/6f/Station.jpg/revision/latest?cb=20100703081515";
                    break;
                case "mp_kwai":
                    alias = "Banzai";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/de/Banzaiscreenshot.jpg/revision/latest?cb=20100703081611";
                    break;
                case "mp_stalingrad":
                    alias = "Corrosion";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/58/Corrosionscreenshot.jpg/revision/latest?cb=20100703081643";
                    break;
                case "mp_docks":
                    alias = "Sub Pens";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/50/Subpensscreenshot.jpg/revision/latest?cb=20100703081718";
                    break;
                case "mp_drum":
                    alias = "Battery";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/30/Battery.jpg/revision/latest?cb=20100703081836";
                    break;
                case "mp_bgate":
                    alias = "Breach";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9e/Breach.jpg/revision/latest?cb=20100703082957";
                    break;
                case "mp_vodka":
                    alias = "Revolution";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f3/Revolution.jpg/revision/latest?cb=20100703083210";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "T5") {
            switch (console) {
                case "mp_array":
                    alias = "Array";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/35/Bare_Load_Screen_Array_BO.jpg/revision/latest?cb=20110303121651";
                    break;
                case "mp_berlinwall2":
                    alias = "Berlin Wall";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/78/Berlin_Wall_loadscreen_BO.jpg/revision/latest?cb=20121108093747";
                    break;
                case "mp_gridlock":
                    alias = "Convoy";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/7a/Recreated_Load_Screen_Convoy_BO.jpg/revision/latest?cb=20110606062753";
                    break;
                case "mp_cracked":
                    alias = "Cracked";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/1e/Bare_Load_Screen_Cracked_BO.jpg/revision/latest?cb=20110303121738";
                    break;
                case "mp_crisis":
                    alias = "Crisis";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f6/Bare_Load_Screen_Crisis_BO.jpg/revision/latest?cb=20110303121824";
                    break;
                case "mp_discovery":
                    alias = "Discovery";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/09/Discovery_loadscreen_BO.jpg/revision/latest?cb=20121108094733";
                    break;
                case "mp_drivein":
                    alias = "Drive In";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9e/Galactic_Sign_Drive-In_BO.png/revision/latest?cb=20120118175649";
                    break;
                case "mp_firingrange":
                    alias = "Firing Range";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/82/Bare_Load_Screen_Firing_Range_BO.jpg/revision/latest?cb=20110303121918";
                    break;
                case "mp_duga":
                    alias = "Grid";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/41/Bare_Load_Screen_Grid_BO.jpg/revision/latest?cb=20110303122000";
                    break;
                case "mp_area51":
                    alias = "Hangar 18";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a2/Hangar_18_loadscreen_BO.png/revision/latest?cb=20130714193416";
                    break;
                case "mp_hanoi":
                    alias = "Hanoi";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/eb/Bare_Load_Screen_Hanoi_BO.jpg/revision/latest?cb=20110303122041";
                    break;
                case "mp_cairo":
                    alias = "Havana";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e7/Bare_Load_Screen_Havana_BO.jpg/revision/latest?cb=20110303122124";
                    break;
                case "mp_golfcourse":
                    alias = "Hazard";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/48/Overview_Hazard_BO.png/revision/latest?cb=20120119064515";
                    break;
                case "mp_hotel":
                    alias = "Hotel";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/ca/Bare_Load_Screen_Hotel_BO.png/revision/latest?cb=20110617143724";
                    break;
                case "mp_havoc":
                    alias = "Havoc";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c6/Bare_Load_Screen_Jungle_BO.jpg/revision/latest?cb=20110303122217";
                    break;
                case "mp_kowloon":
                    alias = "Kowloon";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a7/Kowloon_loadscreen_BO.jpg/revision/latest?cb=20121108094415";
                    break;
                case "mp_cosmodrome":
                    alias = "Launch";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c6/Bare_Load_Screen_Launch_BO.jpg/revision/latest?cb=20110303122251";
                    break;
                case "mp_nuked":
                    alias = "Nuketown";
                    map = "https://i.ytimg.com/vi/ysr0CyyJx8E/maxresdefault.jpg";
                    break;
                case "mp_radiation":
                    alias = "Radiation";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/20/Bare_Load_Screen_Radiation_BO.jpg/revision/latest?cb=20110303122417";
                    break;
                case "mp_silo":
                    alias = "Silo";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a7/Warhead_Silo_BO.png/revision/latest?cb=20120121223541";
                    break;
                case "mp_stadium":
                    alias = "Stadium";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/24/Stadium_loadscreen_BO.jpg/revision/latest?cb=20121108092948";
                    break;
                case "mp_outskirts":
                    alias = "Stockpile";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2d/Bare_Load_Screen_Stockpile_BO.jpg/revision/latest?cb=20110605094802";
                    break;
                case "mp_mountain":
                    alias = "Summit";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/54/Bare_Load_Screen_Summit_BO.jpg/revision/latest?cb=20110303122702";
                    break;
                case "mp_villa":
                    alias = "Villa";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2a/Bare_Load_Screen_Villa_BO.jpg/revision/latest?cb=20110303122503";
                    break;
                case "mp_russianbase":
                    alias = "WMD";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/12/Bare_Load_Screen_WMD_BO.jpg/revision/latest?cb=20110303122544";
                    break;
                case "mp_zoo":
                    alias = "Zoo";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/78/Recreated_Load_Screen_Zoo_BO.jpg/revision/latest?cb=20110606065905";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "T6") {
            switch (console) {
                case "mp_la":
                    alias = "Aftermath";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/ba/Aftermath_loading_screen_BOII.png/revision/latest?cb=20130125112538";
                    break;
                case "mp_dockside":
                    alias = "Cargo";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d4/Cargo_loadscreen_BOII.png/revision/latest?cb=20130120072815";
                    break;
                case "mp_carrier":
                    alias = "Carrier";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/88/Carrier_loadscreen_BOII.png/revision/latest?cb=20121209072436";
                    break;
                case "mp_drone":
                    alias = "Drone";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/5b/Drone_loadscreen_BOII.png/revision/latest?cb=20121209074205";
                    break;
                case "mp_express":
                    alias = "Express";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d1/Express_Load_Screen_BOII.png/revision/latest?cb=20121209074544";
                    break;
                case "mp_hijacked":
                    alias = "Hijacked";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/79/Hijacked_Load_Screen_BOII.png/revision/latest?cb=20121209075028";
                    break;
                case "mp_meltdown":
                    alias = "Meltdown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/92/Meltdown_Load_Screen_BOII.png/revision/latest?cb=20121209075341";
                    break;
                case "mp_overflow":
                    alias = "Overflow";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/80/Overflow_Load_Screen_BOII.png/revision/latest?cb=20121209075750";
                    break;
                case "mp_nightclub":
                    alias = "Plaza";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/74/Plaza_Load_Screen_BOII.png/revision/latest?cb=20130125112602";
                    break;
                case "mp_raid":
                    alias = "Raid";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/29/Raid_Load_Screen_BOII.png/revision/latest?cb=20121209080157";
                    break;
                case "mp_slums":
                    alias = "Slums";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/04/Slums_Load_Screen_BOII.png/revision/latest?cb=20121209080826";
                    break;
                case "mp_village":
                    alias = "Standoff";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/1f/Standoff_Load_Screen_BOII.png/revision/latest?cb=20121209080838";
                    break;
                case "mp_turbine":
                    alias = "Turbine";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/50/Turbine_Load_Screen_BOII.png/revision/latest?cb=20121209081207";
                    break;
                case "mp_socotra":
                    alias = "Yemen";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/6d/Yemen_Load_Screen_BOII.png/revision/latest?cb=20121209071959";
                    break;
                case "mp_nuketown_2020":
                    alias = "Nuketown 2025";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/03/Nuketown_2025_Load_Screen_BOII.png/revision/latest?cb=20121217102325";
                    break;
                case "mp_downhill":
                    alias = "Downhill";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/28/Downhill_In-Game.jpg/revision/latest?cb=20130201205402";
                    break;
                case "mp_mirage":
                    alias = "Mirage";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d3/Mirage_loadscreen_BOII.png/revision/latest?cb=20140426185229";
                    break;
                case "mp_hydro":
                    alias = "Hydro";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/44/Hydro_In-Game.jpg/revision/latest?cb=20130201204341";
                    break;
                case "mp_skate":
                    alias = "Grind";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/86/Grind_In-Game.jpg/revision/latest?cb=20130201203728";
                    break;
                case "mp_concert":
                    alias = "Encore";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4d/Encore_loadscreen_BOII.png/revision/latest?cb=20130905100408";
                    break;
                case "mp_magma":
                    alias = "Magma";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/30/Magma_loadscreen_BOII.png/revision/latest?cb=20130905100136";
                    break;
                case "mp_vertigo":
                    alias = "Vertigo";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f6/Vertigo_loadscreen_BOII.png/revision/latest?cb=20130905095457";
                    break;
                case "mp_studio":
                    alias = "Studio";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/1e/Studio_loadscreen_BOII.png/revision/latest?cb=20130905095718";
                    break;
                case "mp_uplink":
                    alias = "Uplink";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fc/Uplink_loadscreen_BOII.png/revision/latest?cb=20130905095254";
                    break;
                case "mp_bridge":
                    alias = "Detour";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/04/Detour_loadscreen_BOII.png/revision/latest?cb=20130905095021";
                    break;
                case "mp_castaway":
                    alias = "Cove";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ee/Cove_loadscreen_BOII.png/revision/latest?cb=20130905100640";
                    break;
                case "mp_paintball":
                    alias = "Rush";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2e/Rush_loadscreen_BOII.png/revision/latest?cb=20130905095938";
                    break;
                case "mp_dig":
                    alias = "Dig";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/83/Dig_loadscreen_BOII.png/revision/latest?cb=20140426105014";
                    break;
                case "mp_frostbite":
                    alias = "Frost";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/43/Frost_loadscreen_BOII.png/revision/latest?cb=20140426105546";
                    break;
                case "mp_pod":
                    alias = "Pod";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/42/Pod_loadscreen_BOII.png/revision/latest?cb=20140426105842";
                    break;
                case "mp_takeoff":
                    alias = "Takeoff";
                    map = "https://static.wikia.nocookie.net/callofduty/images/3/3f/Takeoff_loadscreen_BOII.png/revision/latest?cb=20140426110209";
                    break;
                case "zm_buried":
                    alias = "Buried/Resolution 1295";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/71/Buried_menu_BOII.png/revision/latest?cb=20161102222409";
                    break;
                case "zm_highrise":
                    alias = "Die Rise/Great Leap Forward";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/60/Die_Rise_menu_selection_BO2.png/revision/latest?cb=20161102222915";
                    break;
                case "zm_nuked":
                    alias = "Nuketown";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/74/Nuketown_menu_selection_BO2.png/revision/latest?cb=20161102222934";
                    break;
                case "zm_prison":
                    alias = "Mob of the Dead";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/aa/Mob_of_the_Dead_menu_selection_BO2.png/revision/latest?cb=20161102222825";
                    break;
                case "zm_tomb":
                    alias = "Origins";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b2/Origins_Lobby_Icon_BO2.png/revision/latest?cb=20161102222425";
                    break;
                case "zm_transit_dr":
                    alias = "Diner";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/b4/Diner_TranZit_BOII.png/revision/latest?cb=20130224071848";
                    break;
                case "zm_transit":
                    alias = "Green Run/Bus Depot/Farm/Town";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f9/TranZit_lobby_BOII.png/revision/latest?cb=20161102222339";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "T7") {
            switch (console) {
                case "mp_apartments":
                    alias = "Evac";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/41/Evac_Map_Preview_BO3.png/revision/latest?cb=20200804015812";
                    break;
                case "mp_biodome":
                    alias = "Aquarium";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a8/Aquarium_Map_Preview_BO3.png/revision/latest?cb=20200804014624";
                    break;
                case "mp_chinatown":
                    alias = "Exodus";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/aa/Exodus_Map_Preview_BO3.png/revision/latest?cb=20200804015813";
                    break;
                case "mp_ethiopia":
                    alias = "Hunted";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/50/Hunted_menu_icon_BO3.jpg/revision/latest?cb=20180311204011";
                    break;
                case "mp_havoc":
                    alias = "Havoc";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/17/Havoc_Map_Preview_BO3.png/revision/latest?cb=20200804002228";
                    break;
                case "mp_infection":
                    alias = "Infection";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/9a/Infection_Map_Preview_BO3.png/revision/latest?cb=20200804015817";
                    break;
                case "mp_metro":
                    alias = "Metro";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/60/Metro_Map_Preview_BO3.png/revision/latest?cb=20200804015818";
                    break;
                case "mp_redwood":
                    alias = "Redwood";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/18/Redwood_Map_Preview_BO3.png/revision/latest?cb=20200804015819";
                    break;
                case "mp_sector":
                    alias = "Combine";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/7e/Combine_Map_Preview_BO3.png/revision/latest?cb=20200804015811";
                    break;
                case "mp_spire":
                    alias = "Breach";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e8/Breach_Map_Preview_BO3.png/revision/latest?cb=20200804015810";
                    break;
                case "mp_stronghold":
                    alias = "Stronghold";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/42/Stronghold_Map_Preview_BO3.png/revision/latest?cb=20200804022135";
                    break;
                case "mp_veiled":
                    alias = "Fringe";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ee/Fringe_Map_Preview_BO3.png/revision/latest?cb=20200804015814";
                    break;
                case "mp_nuketown_x":
                    alias = "Nuk3town";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ef/Nuk3town_menu_icon_BO3.jpg/revision/latest?cb=20180523201916";
                    break;
                case "mp_crucible":
                    alias = "Gauntlet";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/79/Gauntlet_Loading_Screen_BO3.png/revision/latest?cb=20160131214452";
                    break;
                case "mp_rise":
                    alias = "Rise";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/79/Rise_Loading_Screen_BO3.png/revision/latest?cb=20160131214729";
                    break;
                case "mp_skyjacked":
                    alias = "Skyjacked";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/4d/Skyjacked_menu_icon_BO3.jpg/revision/latest?cb=20180523010428";
                    break;
                case "mp_waterpark":
                    alias = "Splash";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e0/Splash_Loading_Screen_BO3.png/revision/latest?cb=20160131214058";
                    break;
                case "mp_aerospace":
                    alias = "Spire";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/47/Spire_menu_icon_BO3.jpg/revision/latest?cb=20180523013350";
                    break;
                case "mp_banzai":
                    alias = "Verge";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/12/Verge_menu_icon_BO3.jpg/revision/latest?cb=20180523011351";
                    break;
                case "mp_conduit":
                    alias = "Rift";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/59/Rift_menu_icon_BO3.jpg/revision/latest?cb=20180523205348";
                    break;
                case "mp_kung_fu":
                    alias = "Knockout";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/6e/Knockout_menu_icon_BO3.jpg/revision/latest?cb=20180523012843";
                    break;
                case "mp_arena":
                    alias = "Rumble";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f9/Rumble_menu_icon_BO3.jpg/revision/latest?cb=20180311222050";
                    break;
                case "mp_cryogen":
                    alias = "Cyrogen";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/da/Screen_Shot_2018-03-27_at_15.26.07.png/revision/latest?cb=20180401121336";
                    break;
                case "mp_rome":
                    alias = "Empire";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/80/Empire_Map_Icon_BOIII.jpg/revision/latest?cb=20160812181614";
                    break;
                case "mp_shrine":
                    alias = "Berserk";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/fc/Screen_Shot_2018-04-01_at_13.43.54.png/revision/latest?cb=20180401124753";
                    break;
                case "mp_city":
                    alias = "Rupture";
                    map = "https://static.wikia.nocookie.net/callofduty/images/0/0e/Rupture_BOIII.jpeg/revision/latest?cb=20160825190008";
                    break;
                case "mp_miniature":
                    alias = "Micro";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e1/Micro_Loading_Screen_BO3.png/revision/latest?cb=20170612151647";
                    break;
                case "mp_ruins":
                    alias = "Citadel";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/cc/Screen_Shot_2018-04-01_at_13.44.50.png/revision/latest?cb=20180401143041";
                    break;
                case "mp_western":
                    alias = "Outlaw";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/25/Outlaw_BOIII.jpeg/revision/latest?cb=20160825185938";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "SHG1") {
            switch (console) {
                case "mp_refraction":
                    alias = "Ascend";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a5/Ascend_loading_screen_AW.png/revision/latest?cb=20150402170105";
                    break;
                case "mp_lab2":
                    alias = "Bio Lab";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e7/Bio_Lab_loading_screen_AW.png/revision/latest?cb=20150402164955";
                    break;
                case "mp_comeback":
                    alias = "Comeback";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/a3/Comeback_loading_screen_AW.png/revision/latest?cb=20150402170220";
                    break;
                case "mp_laser2":
                    alias = "Defender";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/c2/Defender_Map_AW.png/revision/latest?cb=20150125135028";
                    break;
                case "mp_detroit":
                    alias = "Detroit";
                    map = "https://static.wikia.nocookie.net/callofduty/images/c/cb/Detroit_Map_AW.png/revision/latest?cb=20150125135608";
                    break;
                case "mp_greenband":
                    alias = "Greenband";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/63/Greenband_loading_screen_AW.png/revision/latest?cb=20150402170141";
                    break;
                case "mp_levity":
                    alias = "Horizon";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/76/Horizon_loading_screen_AW.png/revision/latest?cb=20150402165803";
                    break;
                case "mp_instinct":
                    alias = "Instinct";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/73/Instinct_Map_AW.png/revision/latest?cb=20150125135946";
                    break;
                case "mp_recovery":
                    alias = "Recovery";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f1/Recovery_Map_AW.png/revision/latest?cb=20150125140230";
                    break;
                case "mp_venus":
                    alias = "Retreat";
                    map = "https://static.wikia.nocookie.net/callofduty/images/a/aa/Retreat_loading_screen_AW.png/revision/latest?cb=20150402170027";
                    break;
                case "mp_prison":
                    alias = "Riot";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2e/Riot_Map_AW.png/revision/latest?cb=20150125140554";
                    break;
                case "mp_solar":
                    alias = "Solar";
                    map = "https://static.wikia.nocookie.net/callofduty/images/6/65/Solar_Map_AW.png/revision/latest?cb=20150125140854";
                    break;
                case "mp_terrace":
                    alias = "Terrace";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/10/Terrace_loading_screen_AW.png/revision/latest?cb=20150402165845";
                    break;
                case "mp_dam":
                    alias = "Atlas Gorge";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/46/Atlas_Gorge_Map_AW.png/revision/latest?cb=20150125134232";
                    break;
                case "mp_spark":
                    alias = "Shop Shop";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/20/Chop_Shop_Environment_AW.png/revision/latest?cb=20150429185159";
                    break;
                case "mp_climate_3":
                    alias = "Climate";
                    map = "https://static.wikia.nocookie.net/callofduty/images/8/85/Climate_Environment_AW.png/revision/latest?cb=20150429183851";
                    break;
                case "mp_sector17":
                    alias = "Compound";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/ea/Compound_Promo_AW.png/revision/latest?cb=20150526191037";
                    break;
                case "mp_lost":
                    alias = "Core";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/7a/Core_Environment_AW.jpg/revision/latest?cb=20150116234301";
                    break;
                case "mp_torqued":
                    alias = "Drift";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2a/Drift_Environment_AW.jpg/revision/latest?cb=20150116234625";
                    break;
                case "mp_fracture":
                    alias = "Fracture";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/58/Fracture_Loading_Screen_AW.png/revision/latest?cb=20161128124952";
                    break;
                case "mp_kremlin":
                    alias = "Kremlin";
                    map = "https://static.wikia.nocookie.net/callofduty/images/9/99/Kremlin_Loading_Screen_AW.png/revision/latest?cb=20161128125546";
                    break;
                case "mp_lair":
                    alias = "Overload";
                    map = "https://static.wikia.nocookie.net/callofduty/images/f/f2/Overload_Loading_Screen_AW.png/revision/latest?cb=20161128115756";
                    break;
                case "mp_bigben2":
                    alias = "Parliament";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/46/Parliament_Loading_Screen_AW.png/revision/latest?cb=20161128125556";
                    break;
                case "mp_perplex_1":
                    alias = "Perplex";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d9/Perplex_Environment_AW.png/revision/latest?cb=20150429181437";
                    break;
                case "mp_liberty":
                    alias = "Quarantine";
                    map = "https://static.wikia.nocookie.net/callofduty/images/7/7c/Quarantine_Loading_Screen_AW.png/revision/latest?cb=20160214220724";
                    break;
                case "mp_clowntown3":
                    alias = "Sideshow";
                    map = "https://static.wikia.nocookie.net/callofduty/images/4/45/Sideshow_Environment_AW.jpg/revision/latest?cb=20150116234923";
                    break;
                case "mp_blackbox":
                    alias = "Site 244";
                    map = "https://static.wikia.nocookie.net/callofduty/images/1/14/Site_244_Environment_AW.png/revision/latest?cb=20150429183525";
                    break;
                case "mp_highrise2":
                    alias = "Skyrise";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/db/Skyrise_Loading_Screen_AW.png/revision/latest?cb=20161128125606";
                    break;
                case "mp_seoul2":
                    alias = "Swarn";
                    map = "https://static.wikia.nocookie.net/callofduty/images/e/e2/Swarm_artwork_AW.png/revision/latest?cb=20150727184217";
                    break;
                case "mp_urban":
                    alias = "Urban";
                    map = "https://static.wikia.nocookie.net/callofduty/images/5/52/Urban_Environment_AW.jpg/revision/latest?cb=20150116235245";
                    break;
                case "mp_zombie_ark":
                    alias = "Outbreak";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/db/Outbreak_Environment_AW.jpg/revision/latest?cb=20150116235718";
                    break;
                case "mp_zombie_brg":
                    alias = "Infection";
                    map = "https://static.wikia.nocookie.net/callofduty/images/2/2e/Infection_environment_AW.jpg/revision/latest?cb=20150318181252";
                    break;
                case "mp_zombie_h2o":
                    alias = "Carrier";
                    map = "https://static.wikia.nocookie.net/callofduty/images/b/bd/Carrier_Ingame_Icon_AW.jpg/revision/latest?cb=20180805025428";
                    break;
                case "mp_zombie_lab":
                    alias = "Descent";
                    map = "https://static.wikia.nocookie.net/callofduty/images/d/d9/ExoZombies_Descent_AW.jpg/revision/latest?cb=20150803181055";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else if (gname == "CSGO" || gname == "CSGOSM") {
            switch (console) {
                case "ar_baggage":
                    alias = "Baggage";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c4/Ar_baggage.png";
                    break;
                case "ar_dizzy":
                    alias = "Dizzy";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/20/Ar_dizzy_thumbnail.jpg";
                    break;
                case "ar_lunacy":
                    alias = "Lunacy";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/ca/Ar_lunacy.png";
                    break;
                case "ar_monastery":
                    alias = "Monastery";
                    map = "https://static.wikia.nocookie.net/cswikia/images/e/e1/Ar_monastery.png";
                    break;
                case "ar_shoots":
                    alias = "Shoots";
                    map = "https://static.wikia.nocookie.net/cswikia/images/5/5d/Ar_shoots.png";
                    break;
                case "cs_agency":
                    alias = "Agency";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c7/Cs_agency_thumbnail.jpg";
                    break;
                case "cs_assault":
                    alias = "Assault";
                    map = "https://static.wikia.nocookie.net/cswikia/images/0/00/Cs_assault_go.png";
                    break;
                case "cs_italy":
                    alias = "Italy";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/2c/Cs_italy_csgo.png";
                    break;
                case "cs_militia":
                    alias = "Militia";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/2b/Csgo_militia_pic1.jpg";
                    break;
                case "cs_office":
                    alias = "Office";
                    map = "https://static.wikia.nocookie.net/cswikia/images/f/f7/Csgo-cs-office.png";
                    break;
                case "de_ancient":
                    alias = "Ancient";
                    map = "https://static.wikia.nocookie.net/cswikia/images/9/94/De_ancient.png";
                    break;
                case "de_bank":
                    alias = "Bank";
                    map = "https://static.wikia.nocookie.net/cswikia/images/a/a9/Csgo-de-bank.png";
                    break;
                case "de_cache":
                    alias = "Cache";
                    map = "https://static.wikia.nocookie.net/cswikia/images/5/5b/De_cache.png";
                    break;
                case "de_calavera":
                    alias = "Calavera";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/24/EozeThnXYAouxrf.jpg";
                    break;
                case "de_canals":
                    alias = "Canals";
                    map = "https://static.wikia.nocookie.net/cswikia/images/5/56/De_canals_thumbnail.jpg";
                    break;
                case "de_cbble":
                    alias = "Cobblestone";
                    map = "https://static.wikia.nocookie.net/cswikia/images/f/f1/De_cbble_loading_screen.jpg";
                    break;
                case "de_dust2":
                    alias = "Dust II";
                    map = "https://static.wikia.nocookie.net/cswikia/images/6/61/CSGO_Dust_2_10th_June_2020_update_A_site_pic_1.jpg";
                    break;
                case "de_grind":
                    alias = "Grind";
                    map = "https://static.wikia.nocookie.net/cswikia/images/d/da/Csgo_grind_map.jpg";
                    break;
                case "de_inferno":
                    alias = "Inferno";
                    map = "https://static.wikia.nocookie.net/cswikia/images/f/f0/Inferno.jpg";
                    break;
                case "de_lake":
                    alias = "Lake";
                    map = "https://static.wikia.nocookie.net/cswikia/images/0/08/Csgo-de-lake.png";
                    break;
                case "de_mirage":
                    alias = "Mirage";
                    map = "https://static.wikia.nocookie.net/cswikia/images/1/1e/CSGO_Mirage_latest_version.jpg";
                    break;
                case "de_mocha":
                    alias = "Mocha";
                    map = "https://static.wikia.nocookie.net/cswikia/images/0/0b/Csgo_map_Mocha.jpg";
                    break;
                case "de_nuke":
                    alias = "Nuke";
                    map = "https://static.wikia.nocookie.net/cswikia/images/9/93/CSGO_Nuke_22_Nov_2019_update_picture_1.jpg";
                    break;
                case "de_overpass":
                    alias = "Overpass";
                    map = "https://static.wikia.nocookie.net/cswikia/images/6/6e/Csgo-de-overpass.png";
                    break;
                case "de_pitstop":
                    alias = "Pitstop";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c6/Csgo_map_Pitstop.jpg";
                    break;
                case "de_safehouse":
                    alias = "Safehouse";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/27/Csgo-de-safehouse.png";
                    break;
                case "de_shortdust":
                    alias = "Shortdust";
                    map = "https://static.wikia.nocookie.net/cswikia/images/7/70/Csgo-shortdust-mid.png";
                    break;
                case "de_shortnuke":
                    alias = "Shortnuke";
                    map = "https://static.wikia.nocookie.net/cswikia/images/8/8b/De_shortnuke.jpg";
                    break;
                case "de_stmarc":
                    alias = "St. Marc";
                    map = "https://static.wikia.nocookie.net/cswikia/images/1/19/Csgo-de-stmarc.png";
                    break;
                case "de_sugarcane":
                    alias = "Sugarcane";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c7/Csgo-de-sugarcane.png";
                    break;
                case "de_train":
                    alias = "Train";
                    map = "https://static.wikia.nocookie.net/cswikia/images/4/4a/De_train_thumbnail.png";
                    break;
                case "de_vertigo":
                    alias = "Vertigo";
                    map = "https://static.wikia.nocookie.net/cswikia/images/4/45/CSGO_Vertigo_16_April_2020_update.jpg";
                    break;
                case "dz_blacksite":
                    alias = "Blacksite";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c1/Dz_blacksite.png";
                    break;
                case "dz_frostbite":
                    alias = "Frostbite";
                    map = "https://static.wikia.nocookie.net/cswikia/images/c/c6/Dz_frostbite.png";
                    break;
                case "dz_sirocco":
                    alias = "Sirocco";
                    map = "https://static.wikia.nocookie.net/cswikia/images/2/27/Blog_sirocco.jpg";
                    break;
                default:
                    alias = console;
                    map = "na";
            }
        } else {
            alias = console;
            map = "na";
        }
        return [alias, map];
    }
};