const db = require('./inner_modules/database').current;
const EE = require('eventemitter3');
const cfg = require('./config');
const extend = require('deep-extend');
const WSM = require('./inner_modules/ws-manager');

class Universe extends EE {
    constructor() {
        super();
        this.cmdrs = {};
        this.cmdrs_api_key = {};

    }

    init() {

        this.wss_cmdrs = new WSM(cfg.main.ws_cmdr);

        this.wss_cmdrs.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let cmdr = await this.get_cmdr({atoken: dat});
            if (cmdr) { return callback(cmdr.id); }
            else { callback(null); }
        };

        this.wss_cmdrs.on('disconnected', async (client) => {
            let cmdr = await this.get_cmdr({id: client.id});
            cmdr.online = false;
            cmdr.save();
            console.log('CMDR', cmdr.name.toUpperCase(), 'leave');
        });

        this.wss_cmdrs.on('connected', async (client) => {
            let cmdr = await this.get_cmdr({id: client.id});
            if (!cmdr) return client.close();

            cmdr.online = true;
            cmdr.save();

            client.c_send('cmdr', {
                name: cmdr.name,
                api_key: cmdr.api_key,
                email: cmdr.email
            });

            console.log('CMDR', cmdr.name.toUpperCase(), 'online');

            this.send_cmdr_history(cmdr.id);

        });

        this.wss_cmdrs.init();
    }

    /* and any records to cmdr's client if it's online */
    send_cmdr_rec(rec) {
        if (this.wss_cmdrs.clients[rec._cmdr_id]) {
            this.wss_cmdrs.clients[rec._cmdr_id].c_send('rec:' + rec.event, rec);
        }
    }

    send_cmdr_history(cmdr_id, limit = 45) {
        let cursor = db.records.find({_cmdr_id: cmdr_id}).sort({timestamp: -1}).limit(limit);
        cursor.forEach((rec) => {
            rec.__from_history = true;
            this.send_cmdr_rec(rec);
        });
    }

    process_record(rec) {
        //todo: process record somehow

    }


    async get_cmdr(by) {
        let cmdr = null;
        if (by.id && this.cmdrs[by.id]) {
            return this.cmdrs[by.id];
        } else {
            let dat = await db.cmdrs.findOne(by);
            if (dat) {
                if (this.cmdrs[dat.id]) return this.cmdrs[dat.id]; //already loaded
                cmdr = new CMDR(dat);
                this.cmdrs[cmdr.id] = cmdr;
                this.cmdrs_api_key[cmdr.api_key] = cmdr;
                return cmdr;
            }
        }
        return cmdr;
    }
}

const UNI = new Universe();

class CMDR {
    constructor(data) {
        extend(this, data);
    }

    save() {
        db.cmdrs.save(this);
    }
}

module.exports = UNI;