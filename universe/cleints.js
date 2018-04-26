const cfg = require('../config');
const WSM = require('./ws-manager');
const UNI = require('./universe');

class Clients {
    constructor() {

    }

    init() {
        this.wss = new WSM(cfg.main.ws_user);

        this.wss.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let user = await this.get_user({atoken: dat});
            if (user) { return callback(user._id); }
            else { callback(null); }
        };

        this.wss.on('disconnected', async (client) => {
            let user = await this.get_user({_id: client.id});
            user.online = false;
            user.save();
            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] leave`);
        });

        this.wss.on('connected', async (client) => {
            let user = await this.get_user({_id: client.id});
            if (!user) return client.close();

            user.online = true;
            user.save();

            this.send_to(user._id, 'user', {
                email: user.email,
                api_key: user.api_key,
            });
            this.send_to(user._id, 'cmdr', user.cmdr);

            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] joined`);

            // todo: send user history... or maybe not only this?
            if (user.journal()) {
                let scans = user.journal().find({event: 'Scan'}).sort({timestamp: -1}).limit(15);
                scans.forEach((rec) => this.send_to(user._id, 'rec:' + 'Scan', rec));
            }
        });

        console.log(`CLIENTS APP WS [${cfg.main.ws_user}]: OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss && this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }

}

const CLL = new Clients();

module.exports = CLL;