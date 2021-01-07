<div align="center">
  <br />
  <p>
    <img src="https://i.ibb.co/qy2p4Lx/adminbot.png" width="546" alt="progressbar" />

  </p>
  <br />
  <p>
    <a href="https://discord.gg/pJHSkZe"><img src="https://discord.com/api/guilds/389745592232050688/embed.png" alt="Discord server" /></a>

</p>
</div>

### Version 2.1.2

_______

### About

**Admin bot** is a discord bot written in [Node.js](https://nodejs.org). It allows you to view relatime game servers and [IW4M Admin](https://raidmax.org/IW4MAdmin/)'s status. Command handler and event handler is added so feel free to extend commands and events.

### Download

Latest binary builds are always available at:

* [GitHub](https://github.com/Sparker-99/Admin-bot/releases)

---

### Setup

**Admin bot** requires less effort to get up and running.

#### Prerequisites

* [Node.js 10](https://nodejs.org/en/download) *or newer*  

#### Installation

* Windows
  + Install Node.js
  + Extract `Admin-bot.zip`
  + Edit `config.js` (add your token, prefix and adminid)
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
  + `nano config.json` (add your token, prefix and adminid)
  + `sudo chmod +x ./StartAdminBot.sh`
  + `./StartAdminBot.sh`
To host the discordBot on any other Linux distro You have to install nodejs and npm for your distro, then the rest is the same on all other Linux Distro.
___

### Configuration

#### Initial Configuration

Create a discord application from [discord developers](https://discordapp.com/developers/applications), click on add bot and copy the token if you dont know how read this [Wiki](https://github.com/Sparker-99/Admin-bot/wiki/Creating-and-adding-a-bot)

* `token` &mdash; Insert the bot token
* `prefix` &mdash; Insert the bot prefix that is used before commands like !help
* `admin_id` &mdash; Insert the `Id` from **IW4MAdminSettings.json** like the image below

![](https://i.ibb.co/mSNc5zk/df.png)

 #### Optional Configuration

* `presence_update_interval` &mdash; You can set bot's custom presence. Use this following parameters below 
  + `{m}` &mdash; max players count
  + `{p}` &mdash; players online count 
  + `{s}` &mdash; total server count
 * `colour` &mdash; You can insert a hex colour code to get that colour for all embed discord messages
 * `ownerid` &mdash; You can insert an administrator's or bot owner's client id to lock botinfo for administrator or bot owner
 * `thumbnail_image_url` &mdash; You can insert an image link to get custom thumbnail for all embed discord messages
 * `footer` &mdash; You can insert a footer message to display as footer for all embed discord messages
 ___

### Changelog

* Added Bot Update checker
* Added Call of Duty Ghosts (IW6) map aliases
* Updated dependencies
* Code cleanup

 
 Linux readme by [Zwambro](https://github.com/Zwambro)