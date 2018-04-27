const cfg = require('../config');
const WSM = require('./ws-manager');
const UNI = require('./universe');

class Clients {
    constructor() {
        this.wss_clients = null;
    }

    init() {
        this.wss_clients = new WSM(cfg.main.ws_user);
        this.wss_clients.name = 'WSM@CLS';
        this.wss_clients.auth = async (cmd, dat, callback) => {

            if (cmd !== 'auth') return callback(null);
            let user = await UNI.get_user({atoken: dat});
            if (user) { return callback(user._id); }
            else { callback(null); }
        };

        this.wss_clients.on('disconnected', async (client) => {
            let user = await UNI.get_user({_id: client.id});
            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] leave`);
            user.online = false;
            user.save();
        });

        this.wss_clients.on('connected', async (client) => {

            let user = await UNI.get_user({_id: client.id});

            if (!user) return client.close();

            this.send_to(user._id, 'user', {
                email: user.email,
                api_key: user.api_key,
            });

            this.send_to(user._id, 'cmdr', user.cmdr);

            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] joined`);

            if (user.journal()) {
                let scans = user.journal().find({event: 'Scan'}).sort({timestamp: -1}).limit(15);
                scans.forEach((rec) => this.send_to(user._id, 'rec:' + 'Scan', rec));
            }

            user.online = true;
            user.save();
        });

        this.wss_clients.init();
        console.log(`CLIENTS APP WS [${cfg.main.ws_user}]: OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss_clients && this.wss_clients.clients[uid]) {
            this.wss_clients.clients[uid].c_send(c, dat);
        }
    }

}

const CLL = new Clients();

module.exports = CLL;