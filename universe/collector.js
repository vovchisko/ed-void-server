const _GLOBALS = require('./globals');

const cfg = require('../config');
const WSM = require('./ws-manager');
const UNI = require('./universe');

class Collector {
    constructor() {
        this.wss_journals = null;


    }

    init() {
        this.wss_journals = new WSM(cfg.main.ws_journals);
        this.wss_journals.cpu = 1;

        this.wss_journals.auth = async (cmd, dat, callback) => {
            console.log(cmd,dat)
            if (cmd !== 'auth') return callback(null);
            let juser = await UNI.get_user({api_key: dat});
            if (juser) { return callback(juser._id); }
            else { callback(null); }
        };

        this.wss_journals.on('disconnected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            console.log(`USR:${juser._id} [ CMDR ${juser.cmdr_name} ] journal disconnected`);
        });

        this.wss_journals.on('connected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            if (!juser) return client.close();

            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] journal connected`);
        });

        this.wss_journals.on('message', (client, c, dat) => {
            console.log(c);
        });

        this.wss_journals.init();
        console.log('collector listening...')
    }

    send_to(uid, c, dat) {
        if (this.wss_journals && this.wss_journals.clients[uid]) {
            this.wss_journals.clients[uid].c_send(c, dat);
        }
    }

}

const CLL = new Collector();
module.exports = CLL;


