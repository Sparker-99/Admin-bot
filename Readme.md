<div align="center">
  <br />
  <p>
    <img src="https://i.gyazo.com/8b3961bbe45d78db05378df80c7af0dd.png" width="546" alt="bot" />
  </p>
  <br />
  <p>
    <a href="https://discord.gg/tGkbpCD"><img src="https://discord.com/api/guilds/389745592232050688/embed.png" alt="Discord server" /></a>
</p>
</div>

### Version 3.0.7

_______

### About

**Admin bot** is a discord bot written in [Discord.js](https://discord.js.org). It allows you to view relatime game servers info, execute server commands directly from discord, view stats and much more. Command handler and event handler is added so feel free to extend commands and events.

___

### How it works
<div align="center">
  <br />
  <p>
    <img src="https://i.gyazo.com/3ac3bcc1fb16eade8d51cef0887448a2.png" width="750" alt="working" />
  </p>
</div>

___

### Download

Latest binary builds are always available at:

* [GitHub (Sqlite)](https://github.com/Sparker-99/Admin-bot/releases)

___

### Prerequisites

* [Node.js 16](https://nodejs.org/en/download) *or newer*
* [IW4M Admin](https://raidmax.org/IW4MAdmin) version 2022.02.02.2 *or newer*
___

### Windows Installation

* Windows Server 2019
   + Install the latest of Node.js (16 or higher)
   + Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)
   + Select Desktop Development with C++, Uncheck all except: 
      * MSVC v142 - VS 2019 C++ x64/x86 Build tools
      * Windows 10 SDK
   + Install latest Python
   + Run following command:
    ```
    npm config set msvs_version 2019
    ```
   + Extract `Admin-bot.zip`
   + Rename `config_default.json` as `config.json`
   + Edit `config.json` (add your token, prefix, webfronturl and adminid)
   + Open console inside the **admin bot's** directory, type `npm i` and hit enter
   + Run `StartAdminBot.cmd` or `npm start` in command prompt
___

### Linux Installation

* Ubuntu 20:04
  + Open Terminal and type:
  + `sudo apt install nodejs npm`
  + `mkdir DiscordBot`
  + `cd DiscordBot`
  + `git clone https://github.com/Sparker-99/Admin-bot.git`
  + `cd Admin-bot`
  + `npm i`
  + `cp config_default.json config.json`
  + `nano config.json` (add your token, prefix, webfronturl and adminid)
  + `chmod +x ./StartAdminBot.sh`
  + `./StartAdminBot.sh`
To host the discordBot on any other Linux distro You have to install nodejs and npm for your distro, then the rest is the same on all other Linux Distro.
___

### Updating to new version

Download [latest build](https://github.com/Sparker-99/Admin-bot/releases) and Extract into old version directory.
+ Existing `config.json` and `database` folder will be not overwritten by the update.
  + NOTE: any update of the `config_default.json` need to be merged manually by the user to the `config.json`.
+ Any edit done on default `commands` files will be lost. Consider backup or rename the file before update.
+ Admin bot v3.0.5 or higher uses `Node 16` which kills any application with critical exceptions. So its recommended to use [PM2](https://pm2.keymetrics.io) or any program that restarts the bot.
___

### Configuration

#### Initial Configuration

Create a discord application from [discord developers](https://discord.com/developers/applications), click on add bot and copy the token if you dont know how read this [Wiki](https://github.com/Sparker-99/Admin-bot/wiki/Creating-and-adding-a-bot)

* `token` &mdash; Insert the bot token
* `prefix` &mdash; Insert the bot prefix that is used before commands like !help
* `webfronturl` &mdash; Insert the IW4M Admin webfront url. In case of local refrain from using 127.0.0.1 or such use IPv4 or DHCP address.
  + Example: https://nbsclan.org, http://192.168.1.2
* `results_perpage` &mdash; Insert a number from **1** upto **10** to set number of results per page of status and players command

 #### Optional Configuration

* `custom_presence` &mdash; You can set bot's custom presence. Use this following parameters below
  + `{m}` &mdash; max players count
  + `{p}` &mdash; players online count
  + `{s}` &mdash; total server count
 * `status_channel_id` &mdash; You can insert a discord channel's id to send autostatus on an interval
 * `statchan_update_interval` &mdash; Specifies how often the bot will update the autostatus in channel in seconds
 * `color` &mdash; You can insert a hex colour code to get that colour for all embed discord messages
 * `thumbnail_image_url` &mdash; You can insert an image link to get custom thumbnail for all embed discord messages
 * `footer` &mdash; You can insert a footer message to display as footer for all embed discord messages
 * `ownerid` &mdash; You can insert an admin's or bot owner's client id to lock botinfo for administrator or bot owner
___

### FAQ

* #### Does Admin bot stores my ID and Password for Webfront ?

  + **No**, Admin bot retrieves **cookies** 🍪 from webfront which is saved and used for executing commands from Discord. Cookies are valid for 30 days or until host machine restart. You can successfully delete id and password in dm after login success message.
  
* #### Why does the connect in serverinfo command not working ?

  + Not all clients support **direct connect**. Even it supports I dont know its launch url. If you know the launch url for **direct connect** for any client contact me on [Discord](https://discord.gg/tGkbpCD)
___

### Contributers

* [Sparker](https://github.com/Sparker-99)
* [Martian](https://github.com/saiteja-madha)
* [Zwambro](https://github.com/Zwambro)
* [Pickle Rick](https://github.com/LelieL91)
* [Insanemode](https://github.com/INSANEMODE)