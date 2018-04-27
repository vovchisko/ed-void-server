const _GLOBALS = require('./globals');

const cfg = require('../config');
const WSM = require('./ws-manager');
const UNI = require('./universe');
const CLS = require('./cleints');

class JCollector {
    constructor() {
        this.wss_journals = null;
    }

    init() {
        this.wss_journals = new WSM(cfg.main.ws_journals);
        this.wss_journals.cpu = 1;
        this.wss_journals.name = 'WSM@JCOLL';

        this.wss_journals.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let juser = await UNI.get_user({api_key: dat});
            if (juser) { return callback(juser._id); }
            else { callback(null); }
        };

        this.wss_journals.on('disconnected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            console.log(`JCOLL: ${juser._id} [ CMDR ${juser.cmdr_name} ] - disconnected`);
        });

        this.wss_journals.on('connected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            if (!juser) return client.close();

            console.log(`JCOLL: ${juser._id} [ CMDR ${juser.cmdr_name} ] - connected`);
        });

        this.wss_journals.on('message', (client, c, dat) => {
            if (c === 'rec') {
                if (dat.pipe && PIPE_EVENTS.includes(dat.rec.event))
                    CLS.send_to(client.id, 'rec:' + dat.rec.event, dat);

                UNI.record(client.id, dat, dat.pipe)
                    .catch((e) => console.log(`UNI.record failed`, e));
            }
        });

        this.wss_journals.init();
        console.log(`JCOLL: [${cfg.main.ws_journals}] - OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss_journals && this.wss_journals.clients[uid]) {
            this.wss_journals.clients[uid].c_send(c, dat);
        }
    }

}

const JCOLL = new JCollector();
module.exports = JCOLL;


