# VPNJE-BOT
Basic mysql crud to manage my openvpn server

### Requirement
- openvpn server
- mysql server
- telegram bot
- nodejs

### Installation
1. `git clone https://github.com/shafiqsaaidin/vpnje-bot.git`
2. `cd vpnje && npm install`

### Configuration
1. make a new .env `cp .env_example .env`
2. set .env file according to your server settings
3. get telegram bot API key from bot father

### Make the bot run on startup
1. `cp -f ./systemd/vpnje-bot.service /etc/systemd/system/`
2. `systemctl daemon-reload`
3. `systemctl enable vpnje-bot`
4. `systemctl start vpnje-bot`

### Todo list
- [x] nodejs error handling
- [ ] allow bot for admin or group use only
- [ ] wireguard support
