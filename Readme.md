<div align="center">
  <br />
  <p>
    <img src="https://i.ibb.co/yBPmJSh/adminbot.png" width="546" alt="bot" />
  </p>
  <br />
  <p>
    <a href="https://discord.gg/tGkbpCD"><img src="https://discord.com/api/guilds/389745592232050688/embed.png" alt="Discord server" /></a>
</p>
</div>

### Version 3.0.2

_______

### About

**Admin bot** is a discord bot written in [Discord.js](https://discord.js.org). It allows you to view relatime game servers info, execute server commands directly from discord, view stats and much more. Command handler and event handler is added so feel free to extend commands and events.

---

### How it works
<div align="center">
  <br />
  <p>
    <img src="https://i.ibb.co/k48FVdt/diagram.png" width="750" alt="working" />
  </p>
</div>

---

### Download

Latest binary builds are always available at:

* [GitHub (Basic)](https://github.com/Sparker-99/Admin-bot/releases)

---

### Setup

**Admin bot** requires less effort to get up and running.

#### Prerequisites

* [Node.js 12](https://nodejs.org/en/download) *or newer*
* [IW4M Admin](https://raidmax.org/IW4MAdmin) version 2021.1.18.2 *or newer*

#### Installation

* Windows
  + Install Node.js
  + Extract `Admin-bot.zip`
  + Edit `config.js` (add your token, prefix, webfronturl and adminid)
  + Open console inside the **admin bot's** directory, type `npm i` and hit enter
  + Run `StartAdminBot.cmd` or `npm start` in command prompt

* Linux (Ubuntu 20:04)
  + Open Terminal and type:
  + `sudo apt install nodejs npm`
  + `mkdir DiscordBot`
  + `cd DiscordBot`
  + `git clone https://github.com/Sparker-99/Admin-bot.git`
  + `cd Admin-bot`
  + `npm i`
  + `nano config.json` (add your token, prefix, webfronturl and adminid)
  + `sudo chmod +x ./StartAdminBot.sh`
  + `./StartAdminBot.sh`
To host the discordBot on any other Linux distro You have to install nodejs and npm for your distro, then the rest is the same on all other Linux Distro.
___

### Configuration

#### Initial Configuration

Create a discord application from [discord developers](https://discordapp.com/developers/applications), click on add bot and copy the token if you dont know how read this [Wiki](https://github.com/Sparker-99/Admin-bot/wiki/Creating-and-adding-a-bot)

* `token` &mdash; Insert the bot token
* `prefix` &mdash; Insert the bot prefix that is used before commands like !help
* `webfronturl` &mdash; Insert the IW4M Admin webfront url. Example: https://nbsclan.org
* `admin_id` &mdash; Insert the `Id` from **IW4MAdminSettings.json** like the image below:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![](https://i.ibb.co/x6DXVcH/id.jpg)

* `results_perpage` &mdash; Insert a number from **1** upto **10** to set number of results per page of status command

 #### Optional Configuration

* `custom_presence` &mdash; You can set bot's custom presence. Use this following parameters below 
  + `{m}` &mdash; max players count
  + `{p}` &mdash; players online count 
  + `{s}` &mdash; total server count
 * `color` &mdash; You can insert a hex colour code to get that colour for all embed discord messages
 * `thumbnail_image_url` &mdash; You can insert an image link to get custom thumbnail for all embed discord messages
 * `footer` &mdash; You can insert a footer message to display as footer for all embed discord messages
 * `ownerid` &mdash; You can insert an administrator's or bot owner's client id to lock botinfo for administrator or bot owner
 * `status_channel` &mdash; The discord channel ID where the server status must be sent
 * `status_delay` &mdash; The timeout between sending server status to channel
 ___

### FAQ

* #### Does Admin bot stores my ID and Password for Webfront ?

  + **No**, Admin bot retrieves **cookies** 🍪 from webfront which is saved and used for executing commands from Discord. Cookies are valid for 30 days or until host machine restart. You can successfully delete id and password in dm after login success message.

* #### Why not use a proper Sqlite database instead of Json database ?

  + Sqlite Requires [Windows-Build-Tools](https://github.com/felixrieseberg/windows-build-tools) which is a hassle for most windows users. So for Advanced Users [Admin bot with Sqlite](https://github.com/Sparker-99/Admin-bot/wiki/Admin-bot-sqlite) is available. There is no need for Windows-Build-Tools in case of linux.
___

### Contributers

* [Sparker](https://github.com/Sparker-99)
* [Martian](https://github.com/saiteja-madha)
* [Zwambro](https://github.com/Zwambro)
* [Insanemode](https://github.com/INSANEMODE)
