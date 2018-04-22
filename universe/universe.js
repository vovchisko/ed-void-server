const db = require('./database').current;
const EE = require('eventemitter3');
const cfg = require('../config');
const extend = require('deep-extend');
const WSM = require('./ws-manager');


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
            console.log('usr:', user.email, '[' + user.curr_cmdr + ']', 'leave');
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

            console.log('usr:', user.email, '[' + user.curr_cmdr + ']', 'online');

            this.send_usr_history(user._id);

        });

        this.wss.init();
    }


    send_to(uid, c, dat) {
        if (this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }

    send_usr_history(uid) {
        let scans = db.rec.Scan.find({_uid: uid}).sort({timestamp: -1}).limit(15);
        scans.forEach((rec) => this.send_to(uid, 'rec:' + 'Scan', rec));
    }

    post_process(rec) {
        if (rec.event === 'Scan') return this.proc_Scan(rec);
        if (rec.event === 'FSDJump') return this.proc_FSDJump(rec);
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(rec);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(rec);
        return;
    }

    async proc_LeaveBody(rec) {
        let user = await this.get_user({_id: rec._uid});
        user.cmdr.body = {
            scanned: null,
            name: null,
            radius: 0,
            gravity: 0,
        };
        this.send_to(rec._uid, 'cmdr', user.cmdr);
        user.save();
    }

    async proc_ApproachBody(rec) {
        let body = await db.bodies.findOne({BodyName: rec.Body});
        let user = await this.get_user({_id: rec._uid});

        let b = {
            scanned: false,
            name: rec.Body,
            radius: 0,
            gravity: 0,
        };

        if (body) {
            b.scanned = true;
            b.name = body.BodyName;
            b.radius = body.Radius;
            b.gravity = body.SurfaceGravity;
        }
        user.cmdr.body = b;
        this.send_to(user._id, 'cmdr', user.cmdr);
        user.save();
    }


    async proc_FSDJump(rec) {
        let system = await db.systems.findOne({_id: rec.StarSystem});

        if (!system) {
            system = {_id: rec.StarSystem, _submited: rec._cmdr};
        }

        for (let i in rec) {
            if (i[0] === '_' || i === 'event' || i.includes('_Localised')) continue;
            system[i] = rec[i];
        }

        await db.systems.save(system);

        let user = await this.get_user({_id: rec._uid});
        user.cmdr.system = system.StarSystem;
        user.cmdr.star_pos = system.StarPos;

        user.cmdr.body = {
            scanned: null,
            name: null,
            radius: 0,
            gravity: 0,
        };

        this.send_to(user._id, 'cmdr', user.cmdr);
        user.save();

    }


    async proc_Scan(rec) {
        let body = await db.bodies.findOne({_id: rec.BodyName});
        let user = await this.get_user({_id: rec._uid});

        //update user scan data if we waiting for it
        if (rec.BodyName === user.cmdr.body.name) {

            user.cmdr.body = {
                scanned: true,
                name: rec.BodyName,
                radius: rec.Radius,
                gravity: rec.SurfaceGravity,
            };

            this.send_to(user._id, 'cmdr', user.cmdr);
            user.save();
        }

        if (body) {
            if (body.ScanType === 'Detailed') return;
        } else {
            body = {_id: rec.BodyName, _submited: rec._cmdr};
        }

        for (let i in rec) {
            if (i[0] === '_' || i === 'event') continue;
            body[i] = rec[i];
        }


        return db.bodies.save(body);
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
        this.cmdrs = [];
        this.cmdr = {name: 'n/a'};
        extend(this, data);
        if (this.curr_cmdr) this.set_cmdr(this.curr_cmdr);
    }

    async save() {
        let snapshot = {};
        extend(snapshot, this);
        for (let i in this) {
            if (i === 'cmdr') delete snapshot[i]; //remove temporary field
        }
        await db.users.save(snapshot);
    }

    upd_head(head) {
        let changed = false;

        if (this.curr_cmdr !== head.cmdr) {
            this.set_cmdr(head.cmdr);
            changed = true;
        }

        if (this.gv !== head.gv) {
            this.gv = head.gv;
            changed = true;
        }

        if (this.lng !== head.lng) {
            this.lng = head.lng;
            changed = true;
        }

        if (changed) {
            this.save();
        }
    }

    set_cmdr(name) {
        if (!name) this.cmdr = {name: 'n/a', body: {}};
        for (let i = 0; i < this.cmdrs.length; i++) {
            if (this.cmdrs[i].name === name) {
                this.cmdr = this.cmdrs[i];
                this.curr_cmdr = name;
                return;
            }
        }

        let new_one = {name: name};
        this.cmdrs.push(new_one);
        this.curr_cmdr = name;
        this.cmdr = new_one;
    }
}


const UNI = new Universe();
module.exports = UNI;


