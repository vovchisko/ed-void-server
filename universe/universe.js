const _GLOBALS = require('./globals');

const db = require('./database').current;
const EE = require('eventemitter3');
const cfg = require('../config');
const extend = require('deep-extend');
const WSM = require('./ws-manager');
const pre = require('./rec_pre_process');

class Universe extends EE {
    constructor() {
        super();
        this.wss = null;
        this.users = {};
        this.users_api_key = {};
    }

    init_wss_server() {

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
            //user.atoken = db.generate_token();
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

        this.wss.init();
    }


    send_to(uid, c, dat) {
        if (this.wss && this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }

    /* ADD NEW ROCORD TO DATABASE */
    async record(user, head, rec, in_pack = false) {
        // do some pre-processing
        pre.process(rec);

        // make sure we have all data for current user
        await user.upd_head(head);

        // is cmdr is here?
        if (!user.cmdr) return console.error(`ERR: USER[${this._id}].record(${rec.event}) - failed. No cmdr yet!`);

        // cool...
        rec._id = rec.event + '/' + rec.timestamp;
        rec.timestamp = new Date(rec.timestamp);
        rec._lng = user.lng;
        rec._gv = user.gv;

        await user.journal().save(rec);

        if (!in_pack && PIPE_EVENTS.includes(rec.event))
            UNI.send_to(user._id, `rec:${rec.event}`, rec);

        UNI.process(user.cmdr, rec);
    }


    process(cmdr, rec) {
        if (rec.event === 'Scan') return this.proc_Scan(cmdr, rec);
        if (rec.event === 'FSDJump') return this.proc_FSDJump(cmdr, rec);
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec);
        return;
    }

    async proc_LeaveBody(cmdr, rec) {
        cmdr.loc.body = {
            scanned: false,
            name: null,
            r: 0,
            g: 0,
        };

        if (cmdr.uid) {
            this.send_to(cmdr.uid, 'cmdr', cmdr);
            return cmdr.save();
        }
    }

    async proc_ApproachBody(cmdr, rec) {
        let body = await db.bodies.findOne({BodyName: rec.Body});

        let b = {
            scanned: false,
            name: rec.Body,
            r: 0,
            g: 0,
        };

        if (body) {
            b.scanned = true;
            b.name = body.BodyName;
            b.r = body.Radius;
            b.g = body.SurfaceGravity;
        }

        cmdr.loc.body = b;
        if (cmdr.uid) {
            this.send_to(cmdr.uid, 'cmdr', cmdr);
            await cmdr.save();
        }
    }

    async proc_FSDJump(cmdr, rec) {
        let system = await db.systems.findOne({_id: rec.StarSystem});

        if (!system) {
            system = {_id: rec.StarSystem, _submited: rec._cmdr};
        }

        for (let i in rec) {
            if (i[0] === '_' || i === 'event' || i.includes('_Localised')) continue;
            system[i] = rec[i];
        }

        await db.systems.save(system);

        cmdr.loc.system.name = system.StarSystem;
        cmdr.loc.system.coord = system.StarPos;
        cmdr.loc.body = {
            scanned: null,
            name: null,
            r: 0,
            g: 0,
        };

        if (cmdr.uid) {
            this.send_to(cmdr.uid, 'cmdr', cmdr);
            await cmdr.save();
        }

    }

    async proc_Scan(cmdr, rec) {
        let body = await db.bodies.findOne({_id: rec.BodyName});

        //update cmr scan data if we waiting for it
        if (cmdr.uid && rec.BodyName === cmdr.loc.body.name) {
            cmdr.loc.body = {
                scanned: true,
                name: rec.BodyName,
                r: rec.Radius,
                g: rec.SurfaceGravity,
            };
            this.send_to(cmdr.uid, 'cmdr', cmdr);
            await  cmdr.save();
        }

        // process scan
        if (body) {
            if (body.ScanType === 'Detailed') return;
        } else {
            body = {_id: rec.BodyName, _submited: rec._cmdr};
        }

        for (let i in rec) {
            if (i[0] === '_' || i === 'event') continue;
            body[i] = rec[i];
        }

        await db.bodies.save(body);
    }

    async get_user(by) {
        let user = null;

        if (by._id && this.users[by._id]) {
            return this.users[by._id];
        } else {
            let dat = await db.users.findOne(by);
            if (dat) {
                if (this.users[dat._id]) return this.users[dat._id]; //already loaded
                user = new USER(dat);
                await user.init();
                this.users[user._id] = user;
                this.users_api_key[user.api_key] = user;
                return user;
            }
        }
        return user;
    }
}


class USER {
    constructor(data) {
        this._id = null;
        this.cmdr = null;
        this.cmdrs = [];
        this.cmdr_name = null;
        this.online = false;
        extend(this, data);
    }

    init() {
        return this.set_cmdr(this.cmdr_name);
    }

    async save() {
        let snapshot = {};
        extend(snapshot, this);
        delete snapshot.cmdr; //remove temporary field from snapshot
        await db.users.save(snapshot);
    }

    async upd_head(head) {
        let changed = false;
        if (this.cmdr_name !== head.cmdr) {
            await this.set_cmdr(head.cmdr);
            changed = true;
        }
        if (this.gv !== head.gv || this.lng !== head.lng) {
            this.gv = head.gv;
            this.lng = head.lng;
            changed = true;
        }
        if (changed) return this.save();
    }

    async set_cmdr(name) {
        if (!name) return;

        //get commander with all the things
        if (this.cmdr) await this.cmdr.save();

        let c = await db.cmdrs.findOne({uid: this._id, name: name});

        if (c) {
            this.cmdr = new CMDR(c);
            this.cmdr_name = c.name;
        } else {
            this.cmdr = new CMDR({
                _id: db.gen_id(),
                uid: this._id,
                name: name,
                loc: {
                    system: {name: null, coord: [0, 0, 0]},
                    body: {name: null, r: 0, g: 0, scanned: false},
                }
            });
            this.cmdr_name = this.cmdr.name;
        }

        if (this.cmdr_name && !this.cmdrs.includes(this.cmdr_name)) this.cmdrs.push(this.cmdr_name);
    }

    journal() {
        if (this.cmdr)
            return db.journal(`[${this._id}] ${this.cmdr.name}`);
    }
}


class CMDR {
    constructor(cmdr_data) {
        this._id = null;
        this.uid = null;
        this.name = null;
        this.loc = {
            system: {name: null, coord: [0, 0, 0]},
            body: {name: null, r: 0, g: 0, scanned: false}
        };

        extend(this, cmdr_data);
    }

    async save() {
        if (!this._id) return; //we can create dummy cmdr and use int in processing
        let snapshot = {};
        extend(snapshot, this);
        await db.cmdrs.save(snapshot);
    }

}

const UNI = new Universe();
module.exports = UNI;


