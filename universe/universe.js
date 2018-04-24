const _GLOBALS = require('./globals');

const db = require('./database').current;
const EE = require('eventemitter3');
const cfg = require('../config');
const extend = require('deep-extend');
const WSM = require('./ws-manager');
const PRE = require('./rec_pre_process');

class Universe extends EE {
    constructor() {
        super();
        this.users = {};
        this.users_api_key = {};
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
                api_key: user.api_key,
                email: user.email
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
        if (this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }


    async record(user, head, rec, in_pack = false) {
        // add specific fields for some records...
        PRE.process(rec);

        // make sure we have all additional fields proceed from header
        await user.upd_head(head);

        // is cmdr is here?
        if (!user.cmdr) return console.error(`ERR: USER[${this._id}].record(${rec.event}) - failed. No cmdr yet!`);

        // cool...
        rec._id = rec.event + '/' + rec.timestamp;
        rec.timestamp = new Date(rec.timestamp);
        rec._lng = user.lng;
        rec._gv = user.gv;


        await user.journal().save(rec);

        UNI.post_process(user, rec);

        if (PIPE_EVENTS.includes(rec.event) && !in_pack)
            UNI.send_to(user._id, `rec:${rec.event}`, rec);

    }


    post_process(user, rec) {
        if (rec.event === 'Scan') return this.proc_Scan(user, rec);
        if (rec.event === 'FSDJump') return this.proc_FSDJump(user, rec);
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(user, rec);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(user, rec);
        return;
    }

    async proc_LeaveBody(user, rec) {
        user.cmdr.body = {
            scanned: false,
            name: null,
            r: 0,
            g: 0,
        };
        this.send_to(user._id, 'cmdr', user.cmdr);
        return user.save_cmdr();
    }

    async proc_ApproachBody(user, rec) {
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
            b.radius = body.Radius;
            b.gravity = body.SurfaceGravity;
        }

        user.cmdr.loc.body = b;
        this.send_to(user._id, 'cmdr', user.cmdr);
        await user.save_cmdr();
    }

    async proc_FSDJump(user, rec) {
        let system = await db.systems.findOne({_id: rec.StarSystem});

        if (!system) {
            system = {_id: rec.StarSystem, _submited: rec._cmdr};
        }

        for (let i in rec) {
            if (i[0] === '_' || i === 'event' || i.includes('_Localised')) continue;
            system[i] = rec[i];
        }

        await db.systems.save(system);

        user.cmdr.loc.system.name = system.StarSystem;
        user.cmdr.loc.system.coord = system.StarPos;
        user.cmdr.body = {
            scanned: null,
            name: null,
            radius: 0,
            gravity: 0,
        };

        this.send_to(user._id, 'cmdr', user.cmdr);
        await user.save_cmdr();
    }

    async proc_Scan(user, rec) {
        let body = await db.bodies.findOne({_id: rec.BodyName});

        //update user scan data if we waiting for it
        if (rec.BodyName === user.cmdr.body.name) {
            user.cmdr.loc.body = {
                scanned: true,
                name: rec.BodyName,
                r: rec.Radius,
                g: rec.SurfaceGravity,
            };
            this.send_to(user._id, 'cmdr', user.cmdr);
            await user.save_cmdr();
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

    async save_cmdr() {
        let snapshot = {};
        extend(snapshot, this.cmdr);
        await db.cmdrs.save(snapshot);
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
        if (!name) return console.log(`USR:${this._id} has no cmdr yet`);
        //get commander with all the things

        if (this.cmdr) await this.save_cmdr();

        let c = await db.cmdrs.findOne({uid: this._id, name: name});

        if (c) {
            this.cmdr = c;
            this.cmdr_name = c.name;
        } else {
            this.cmdr = {
                _id: db.gen_id(),
                uid: this._id,
                name: name,
                loc: {
                    system: {name: null, coord: [0, 0, 0]},
                    body: {name: null, r: 0, g: 0, scanned: false},
                }
            };
            this.cmdr_name = this.cmdr.name;
        }

        if (this.cmdr_name && !this.cmdrs.includes(this.cmdr_name)) this.cmdrs.push(this.cmdr_name);
    }

    journal() {
        if (this.cmdr)
            return db.journal(`[${this._id}] ${this.cmdr.name}`);
    }


}


const UNI = new Universe();
module.exports = UNI;


