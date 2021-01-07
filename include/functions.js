const fetch = require('node-fetch');
module.exports = {
    configcheck(client) {
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
        if (!client.config.custom_presence) {
            client.config.custom_presence = client.config.prefix + 'help';
        }
        if (client.config.colour) {
            client.color = '#' + client.config.colour.replace(/#/gi, '');
        } else
            client.color = '#007acc';

        if (client.config.thumbnail_image_url) {
            client.thumbnail = client.config.thumbnail_image_url;
        } else
            client.thumbnail = 'https://raidmax.org/IW4MAdmin/img/iw4adminicon-3.png';

        if (client.config.footer) {
            client.footer = client.config.footer;
        } else
            client.footer = 'Bot by Sparker, IW4M Admin by Raidmax';
    },

    async vercheck() {
        let data = await fetch('https://api.github.com/repos/Sparker-99/Admin-bot/releases/latest')
            .then((res) => res.json())
            .catch(() => { console.log('\x1b[31mUpdate check failed Github is not reachable\x1b[0m') });

        if (!data) return false;

        if (require('../package.json').version.replace(/[^0-9]/g, '') >= data.tag_name.replace(/[^0-9]/g, ''))
            return "\x1b[32mAdmin Bot is up to date\x1b[0m";
        else
            return "\x1b[33mAdmin bot version " + data.tag_name + " update is avaiable\x1b[0m";
    },

    timeformat(uptime) {
        var days = Math.floor((uptime % 31536000) / 86400);
        var hours = Math.floor((uptime % 86400) / 3600);
        var minutes = Math.floor((uptime % 3600) / 60);
        var seconds = Math.round(uptime % 60);
        return (days > 0 ? days + " days, " : "") + (hours > 0 ? hours + " hours, " : "") + (minutes > 0 ? minutes + " minutes, " : "") + (seconds > 0 ? seconds + " seconds" : "");
    },

    async fetchinfo(id, length) {
        let response = await fetch('http://api.raidmax.org:5000/instance/' + id)
            .then((res) => res.json())
            .catch(() => { console.log('\x1b[31mMasterserver not reachable\x1b[0m') });
        if (response && response.servers) {
            let hostnames = new Array();
            let players = new Array();
            let maxplayers = new Array();
            let gamemap = new Array();
            var total = length || response.servers.length;
            for (i = 0; i < total; i++) {
                if (response.servers[i]) {
                    hostnames[i] = '🔹 ' + response.servers[i].hostname.replace(/\^[0-9:;c]/g, '');
                    players[i] = response.servers[i].clientnum;
                    maxplayers[i] = response.servers[i].maxclientnum;
                    gamemap[i] = response.servers[i].map;
                }
            }
            return [hostnames, players, maxplayers, gamemap, response.uptime];
        } else {
            return false;
        }
    },

    getmap(console) {
        let alias = "";
        switch (console) {
            case "mp_railyard":
                alias = "Railyard";
                break;
            case "mp_convoy":
                alias = "Ambush";
                break;
            case "mp_backlot":
                alias = "Backlot"
                break;
            case "mp_bloc":
                alias = "Bloc";
                break;
            case "mp_bog":
                alias = "Bog";
                break;
            case "mp_countdown":
                alias = "Countdown";
                break;
            case "mp_crash":
                alias = "Crash";
                break;
            case "mp_crossfire":
                alias = "Crossfire";
                break;
            case "mp_citystreets":
                alias = "District";
                break;
            case "mp_farm":
                alias = "Downpour";
                break;
            case "mp_overgrown":
                alias = "Overgrown";
                break;
            case "mp_pipeline":
                alias = "Pipeline";
                break;
            case "mp_shipment":
                alias = "Shipment";
                break;
            case "mp_showdown":
                alias = "Showdown";
                break;
            case "mp_strike":
                alias = "Strike";
                break;
            case "mp_vacant":
                alias = "Vacant";
                break;
            case "mp_cargoship":
                alias = "Wet Work";
                break;
            case "mp_crash_snow":
                alias = "Winter Crash";
                break;
            case "mp_broadcast":
                alias = "Broadcast";
                break;
            case "mp_creek":
                alias = "Creek";
                break;
            case "mp_carentan":
                alias = "Chinatown";
                break;
            case "mp_killhouse":
                alias = "Killhouse";
                break;
            case "mp_airfield":
                alias = "Airfield";
                break;
            case "mp_asylum":
                alias = "Asylum";
                break;
            case "mp_castle":
                alias = "Castle";
                break;
            case "mp_shrine":
                alias = "Cliffside";
                break;
            case "mp_courtyard":
                alias = "Courtyard";
                break;
            case "mp_dome":
                alias = "Dome";
                break;
            case "mp_downfall":
                alias = "Downfall";
                break;
            case "mp_hangar":
                alias = "Hangar";
                break;
            case "mp_makin":
                alias = "Makin";
                break;
            case "mp_outskirts":
                alias = "Outskirts";
                break;
            case "mp_roundhouse":
                alias = "Roundhouse";
                break;
            case "mp_suburban":
                alias = "Upheaval";
                break;
            case "mp_kneedeep":
                alias = "Knee Deep";
                break;
            case "mp_nachtfeuer":
                alias = "Nightfire";
                break;
            case "mp_subway":
                alias = "Station";
                break;
            case "mp_kwai":
                alias = "Banzai";
                break;
            case "mp_stalingrad":
                alias = "Corrosion";
                break;
            case "mp_docks":
                alias = "Sub Pens";
                break;
            case "mp_drum":
                alias = "Battery";
                break;
            case "mp_bgate":
                alias = "Breach";
                break;
            case "mp_vodka":
                alias = "Revolution";
                break;
            case "mp_rust":
                alias = "Rust";
                break;
            case "mp_terminal":
                alias = "Terminal";
                break;
            case "mp_afghan":
                alias = "Afghan";
                break;
            case "mp_derail":
                alias = "Derail";
                break;
            case "mp_estate":
                alias = "Estate";
                break;
            case "mp_favela":
                alias = "Favela";
                break;
            case "mp_highrise":
                alias = "Highrise";
                break;
            case "mp_invasion":
                alias = "Invasion";
                break;
            case "mp_checkpoint":
                alias = "Karachi";
                break;
            case "mp_quarry":
                alias = "Quarry";
                break;
            case "mp_rundown":
                alias = "Rundown";
                break;
            case "mp_boneyard":
                alias = "Scrapyard";
                break;
            case "mp_nightshift":
                alias = "Skidrow";
                break;
            case "mp_subbase":
                alias = "Sub Base";
                break;
            case "mp_underpass":
                alias = "Underpass";
                break;
            case "mp_brecourt":
                alias = "Wasteland";
                break;
            case "mp_overgrown":
                alias = "Overgrown";
                break;
            case "mp_strike":
                alias = "Strike";
                break;
            case "mp_abandon":
                alias = "Carnival";
                break;
            case "mp_trailerpark":
                alias = "Trailer Park";
                break;
            case "mp_fuel2":
                alias = "Fuel";
                break;
            case "mp_storm":
                alias = "Storm";
                break;
            case "mp_complex":
                alias = "Bailout";
                break;
            case "mp_compact":
                alias = "Salvage";
                break;
            case "mp_nuked":
                alias = "Nuketown";
                break;
            case "iw4_credits":
                alias = "Test map";
                break;
            case "mp_bog_sh":
                alias = "Bog";
                break;
            case "mp_cargoship_sh":
                alias = "Freighter";
                break;
            case "mp_cargoship":
                alias = "Cargoship";
                break;
            case "mp_shipment_long":
                alias = "Shipment Long";
                break;
            case "mp_rust_long":
                alias = "Rust Long";
                break;
            case "mp_firingrange":
                alias = "Firing Range";
                break;
            case "mp_storm_spring":
                alias = "Chemical Plant";
                break;
            case "mp_fav_tropical":
                alias = "Tropical Favela";
                break;
            case "mp_estate_tropical":
                alias = "Tropical Estate";
                break;
            case "mp_crash_tropical":
                alias = "Tropical Crash";
                break;
            case "mp_bloc_sh":
                alias = "Forgotten City";
                break;
            case "mp_cross_fire":
                alias = "Crossfire";
                break;
            case "oilrig":
                alias = "Oilrig";
                break;
            case "co_hunted":
                alias = "Village";
                break;
            case "co_hunted":
                alias = "Array";
                break;
            case "mp_berlinwall2":
                alias = "Berlin Wall";
                break;
            case "mp_gridlock":
                alias = "Convoy";
                break;
            case "mp_cracked":
                alias = "Cracked";
                break;
            case "mp_crisis":
                alias = "Crisis";
                break;
            case "mp_discovery":
                alias = "Discovery";
                break;
            case "mp_drivein":
                alias = "Drive In";
                break;
            case "mp_duga":
                alias = "Grid";
                break;
            case "mp_area51":
                alias = "Hangar 18";
                break;
            case "mp_hanoi":
                alias = "Hanoi";
                break;
            case "mp_cairo":
                alias = "Havana";
                break;
            case "mp_golfcourse":
                alias = "Hazard";
                break;
            case "mp_hotel":
                alias = "Hotel";
                break;
            case "mp_havoc":
                alias = "Jungle";
                break;
            case "mp_kowloon":
                alias = "Kowloon";
                break;
            case "mp_cosmodrome":
                alias = "Launch";
                break;
            case "mp_nuked":
                alias = "Nuketown";
                break;
            case "mp_radiation":
                alias = "Radiation";
                break;
            case "mp_silo":
                alias = "Silo";
                break;
            case "mp_stadium":
                alias = "Stadium";
                break;
            case "mp_outskirts":
                alias = "Stockpile";
                break;
            case "mp_mountain":
                alias = "Summit";
                break;
            case "mp_villa":
                alias = "Villa";
                break;
            case "mp_russianbase":
                alias = "WMD";
                break;
            case "mp_zoo":
                alias = "Zoo";
                break;
            case "mp_seatown":
                alias = "Seatown";
                break;
            case "mp_alpha":
                alias = "Lockdown";
                break;
            case "mp_bravo":
                alias = "Mission";
                break;
            case "mp_carbon":
                alias = "Carbon";
                break;
            case "mp_plaza2":
                alias = "Arkaden";
                break;
            case "mp_exchange":
                alias = "Downturn";
                break;
            case "mp_bootleg":
                alias = "Bootleg";
                break;
            case "mp_hardhat":
                alias = "Hardhat";
                break;
            case "mp_interchange":
                alias = "Interchange";
                break;
            case "mp_lambeth":
                alias = "Fallen";
                break;
            case "mp_radar":
                alias = "Outpost";
                break;
            case "mp_mogadishu":
                alias = "Bakaara";
                break;
            case "mp_paris":
                alias = "Resistance";
                break;
            case "mp_underground":
                alias = "Underground";
                break;
            case "mp_village":
                alias = "Village / Standoff";
                break;
            case "mp_aground_ss":
                alias = "Aground";
                break;
            case "mp_boardwalk":
                alias = "Boardwalk";
                break;
            case "mp_burn_ss":
                alias = "U Turn";
                break;
            case "mp_cement":
                alias = "Foundation";
                break;
            case "mp_courtyard_ss":
                alias = "Erosion";
                break;
            case "mp_crosswalk_ss":
                alias = "Intersection";
                break;
            case "mp_hillside_ss":
                alias = "Gateway";
                break;
            case "mp_italy":
                alias = "Piazza";
                break;
            case "mp_meteora":
                alias = "Sanctuary";
                break;
            case "mp_moab":
                alias = "Gulch";
                break;
            case "mp_morningwood":
                alias = "Backbox";
                break;
            case "mp_nola":
                alias = "Parish";
                break;
            case "mp_overwatch":
                alias = "Overwatch";
                break;
            case "mp_park":
                alias = "Liberation";
                break;
            case "mp_qadeem":
                alias = "Oasis";
                break;
            case "mp_restrepo_ss":
                alias = "Lookout";
                break;
            case "mp_roughneck":
                alias = "Offshore";
                break;
            case "mp_shipbreaker":
                alias = "Decommission";
                break;
            case "mp_six_ss":
                alias = "Vortex";
                break;
            case "mp_terminal_cls":
                alias = "Terminal";
                break;
            case "mp_apartments":
                alias = "Evac";
                break;
            case "mp_biodome":
                alias = "Aquarium";
                break;
            case "mp_chinatown":
                alias = "Exodus";
                break;
            case "mp_ethiopia":
                alias = "Hunted";
                break;
            case "mp_havoc":
                alias = "Havoc";
                break;
            case "mp_infection":
                alias = "Infection";
                break;
            case "mp_metro":
                alias = "Metro";
                break;
            case "mp_redwood":
                alias = "Redwood";
                break;
            case "mp_sector":
                alias = "Combine";
                break;
            case "mp_spire":
                alias = "Breach";
                break;
            case "mp_stronghold":
                alias = "Stronghold";
                break;
            case "mp_veiled":
                alias = "Fringe";
                break;
            case "mp_nuketown_x":
                alias = "Nuk3town";
                break;
            case "mp_la":
                alias = "Aftermath";
                break;
            case "mp_dockside":
                alias = "Cargo";
                break;
            case "mp_carrier":
                alias = "Carrier";
                break;
            case "mp_drone":
                alias = "Drone";
                break;
            case "mp_express":
                alias = "Express";
                break;
            case "mp_hijacked":
                alias = "Hijacked";
                break;
            case "mp_meltdown":
                alias = "Meltdown";
                break;
            case "mp_overflow":
                alias = "Overflow";
                break;
            case "mp_nightclub":
                alias = "Plaza";
                break;
            case "mp_raid":
                alias = "Raid";
                break;
            case "mp_slums":
                alias = "Slums";
                break;
            case "mp_turbine":
                alias = "Turbine";
                break;
            case "mp_socotra":
                alias = "Yemen";
                break;
            case "mp_nuketown_2020":
                alias = "Nuketown 2025";
                break;
            case "mp_downhill":
                alias = "Downhill";
                break;
            case "mp_mirage":
                alias = "Mirage";
                break;
            case "mp_hydro":
                alias = "Hydro";
                break;
            case "mp_skate":
                alias = "Grind";
                break;
            case "mp_concert":
                alias = "Encore";
                break;
            case "mp_magma":
                alias = "Magma";
                break;
            case "mp_vertigo":
                alias = "Vertigo";
                break;
            case "mp_studio":
                alias = "Studio";
                break;
            case "mp_uplink":
                alias = "Uplink";
                break;
            case "mp_bridge":
                alias = "Detour";
                break;
            case "mp_castaway":
                alias = "Cove";
                break;
            case "mp_paintball":
                alias = "Rush";
                break;
            case "mp_dig":
                alias = "Dig";
                break;
            case "mp_frostbite":
                alias = "Frost";
                break;
            case "mp_pod":
                alias = "Pod";
                break;
            case "mp_takeoff":
                alias = "Takeoff";
                break;
            case "zm_buried":
                alias = "Buried / Resolution 1295";
                break;
            case "zm_highrise":
                alias = "Die Rise / Great Leap Forward";
                break;
            case "zm_nuked":
                alias = "Nuketown";
                break;
            case "zm_prison":
                alias = "Mob of the Dead";
                break;
            case "zm_tomb":
                alias = "Origins";
                break;
            case "zm_transit_dr":
                alias = "Diner";
                break;
            case "zm_transit":
                alias = "Green Run/Bus Depot/Farm/Town";
                break;
            case "mp_prisonbreak":
                alias = "Prision Break";
                break;
            case "mp_dart":
                alias = "Octane";
                break;
            case "mp_lonestar":
                alias = "Tremor";
                break;
            case "mp_frag":
                alias = "Freight";
                break;
            case "mp_snow":
                alias = "Whiteout";
                break;
            case "mp_fahrenheit":
                alias = "Stormfront";
                break;
            case "mp_hashima":
                alias = "Siege";
                break;
            case "mp_warhawk":
                alias = "Warhawk";
                break;
            case "mp_sovereign":
                alias = "Sovereign";
                break;
            case "mp_zebra":
                alias = "Overload";
                break;
            case "mp_skeleton":
                alias = "Stonehaven";
                break;
            case "mp_chasm":
                alias = "Chasm";
                break;
            case "mp_flooded":
                alias = "Flooded";
                break;
            case "mp_strikezone":
                alias = "Strikezone";
                break;
            case "mp_descent_new":
                alias = "Free Fall";
                break;
            case "mp_dome_ns":
                alias = "Unearthed";
                break;
            case "mp_ca_impact":
                alias = "Collision";
                break;
            case "mp_ca_behemoth":
                alias = "Behemoth";
                break;
            case "mp_battery3":
                alias = "Ruins";
                break;
            case "mp_dig":
                alias = "Pharaoh";
                break;
            case "mp_favela_iw6":
                alias = "Favela";
                break;
            case "mp_pirate":
                alias = "Mutiny";
                break;
            case "mp_zulu":
                alias = "Departed";
                break;
            case "mp_conflict":
                alias = "Dynasty";
                break;
            case "mp_mine":
                alias = "Goldrush";
                break;
            case "mp_shipment_ns":
                alias = "Showtime";
                break;
            case "mp_zerosub":
                alias = "Subzero";
                break;
            case "mp_boneyard_ns":
                alias = "Ignition";
                break;
            case "mp_ca_red_river":
                alias = "Containment";
                break;
            case "mp_ca_rumble":
                alias = "Bayview";
                break;
            case "mp_swamp":
                alias = "Fog";
                break;
            case "mp_alien_town":
                alias = "Point of Contact";
                break;
            case "mp_alien_armory":
                alias = "Nightfall";
                break;
            case "mp_alien_beacon":
                alias = "Mayday";
                break;
            case "mp_alien_dlc3":
                alias = "Awakening";
                break;
            case "mp_alien_last":
                alias = "Exodus";
                break;
            default:
                alias = console;
        }
        return alias;
    }
}