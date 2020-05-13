# Admin Bot
### Quick Start Guide
### Version 1.0.0
_______
### About
**Admin bot** is a discord bot written in [Node.js](https://nodejs.org). It allows you to view relatime game servers and [IW4M Admin](https://raidmax.org/IW4MAdmin/)'s status. Command handler and event handler is added so feel free to extend commands and events.
### Download
Latest binary builds are always available at:
- [GitHub](https://github.com/Sparker-99/Admin-bot/releases)


---
### Setup
**Admin bot** requires less effort to get up and running.
#### Prerequisites
* [Node.js 7.6](https://nodejs.org/en/download) *or newer*  
#### Installation
1. Install Node.js
2.  Extract `Admin-bot.zip`  
#### Launching
- Windows
  - Configure **config.js**
  - Open console inside the **admin bot's** directory, type `npm i` and hit enter
  - Run `StartAdminBot.cmd`

- Linux (Ubuntu 20:04)
  - Open Terminal and type:
  - `sudo apt install nodejs npm` 
  - `mkdir DiscordBot`
  - `cd DiscordBot`
  - `git clone https://github.com/Sparker-99/Admin-bot.git`
  - `cd Admin-bot`
  - `npm i`
  - `nano config.json` (add your BOT token and admin ID)
  - `sudo chmod +x ./StartAdminBot.sh`
  - `./StartAdminBot.sh`

To host the discordBot on any other Linux distro You have to install nodejs and npm for your distro, then the rest is the same on all other Linux Distro.
___

### Configuration
#### Initial Configuration

Create a discord application from [discord developers](https://discordapp.com/developers/applications), click on add bot and copy the token if you dont know how read this [Wiki](https://github.com/Sparker-99/Admin-bot/wiki/Creating-and-adding-a-bot)

* `token` &mdash; Insert the bot token
* `prefix` &mdash; Insert the bot prefix that is used before commands like !help
* `adminid` &mdash; Insert the `Id` from **IW4MAdminSettings.json** like the image below

![](https://i.ibb.co/mSNc5zk/df.png)

* `colour` &mdash; You can insert a hex colour code to get that colour for all embed discord messages

 Note: colour is not mandatory you can keep the field empty
 
 Linux readme by [Zwambro](https://github.com/Zwambro)
