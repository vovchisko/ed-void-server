const _GLOBALS = require('./globals');

const db = require('./database').current;
const EE = require('eventemitter3');
const extend = require('deep-extend');
const pre = require('./rec_pre_process');

class Universe extends EE {
    constructor() {
        super();
        this.wss = null;
        this.users = {};
        this.cmdrs = {};
        this.users_api_key = {};
        console.log('UNIVERSE: OK');
    }

    init() {
        this.wss = require('./cleints');
        console.log('UNIVERSE WSS: CONNECTED');
    }


    /* ONLY FOR NEW RECORDS */
    async record(user_id, dat, pipe = false) {

        //dat.rec, dat.cmdr, dat.gv, dat.lng
        let user = await this.get_user({_id: user_id});

        if (!user) return console.log('no user found!');

        // do some pre-processing
        pre.process(dat.rec);

        // make sure we have all data for current user
        await user.cmdr_update(dat.cmdr, dat.gv, dat.lng); // todo: should we pipe any changes here? should we even care about it?

        // is cmdr is here?
        if (!user.cmdr) return console.error(`ERR: USER[${this._id}].record(${dat.rec.event}) - FAIL! No cmdr set!`);

        let rec = dat.rec;

        // cool...
        rec._id = rec.event + '/' + rec.timestamp;
        rec.timestamp = new Date(rec.timestamp);
        rec._lng = user.lng;
        rec._gv = user.gv;

        await user.journal().save(rec);

        UNI.process(user.cmdr, rec);
    }


    process(cmdr, rec, pipe = false) {
        if (rec.event === 'Scan') return this.proc_Scan(cmdr, rec, pipe);
        if (rec.event === 'FSDJump') return this.proc_FSDJump(cmdr, rec, pipe);
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec, pipe);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec, pipe);
    }

    async proc_LeaveBody(cmdr, rec, pipe = false) {
        cmdr.loc.body = {
            scanned: false,
            name: null,
            r: 0,
            g: 0,
        };

        await  cmdr.save();

        this.broadcast(cmdr.uid, 'cmdr', cmdr);

    }

    async proc_ApproachBody(cmdr, rec, pipe = false) {
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

        await cmdr.save();

        this.broadcast(cmdr.uid, 'cmdr', cmdr);
    }

    async proc_FSDJump(cmdr, rec, pipe = false) {
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

        await cmdr.save();

        if (pipe) this.broadcast(cmdr.uid, 'cmdr', cmdr);


    }

    async proc_Scan(cmdr, rec, pipe = false) {
        let body = await db.bodies.findOne({_id: rec.BodyName});


        //update cmr scan data if we waiting for it
        if (cmdr.uid && rec.BodyName === cmdr.loc.body.name) {
            cmdr.loc.body = {
                scanned: true,
                name: rec.BodyName,
                r: rec.Radius,
                g: rec.SurfaceGravity,
            };
            if (pipe) this.broadcast(cmdr.uid, 'cmdr', cmdr);
            await cmdr.save();
        }


        // process scan
        if (body) {
            if (body.ScanType === 'Detailed') return;
        } else {
            body = {_id: rec.BodyName, _submited: rec._cmdr};
        }

        //create body record
        for (let i in rec) {
            if (i[0] === '_' || i === 'event') continue;
            body[i] = rec[i];
        }
        await db.bodies.save(body);
    }

    broadcast(uid, c, dat) {
        if (this.wss) this.wss.send_to(uid, c, dat);
    }

    async get_user(by) {
        let user = null;

        if (by._id && this.users[by._id]) {
            return this.users[by._id];
        } else if (by.api_key && this.users_api_key[by.api_key]) {
            return this.users_api_key[by.api_key];
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
        this._changed = false;
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
        if (!this._changed) return;
        let snapshot = {};
        extend(snapshot, this);
        delete snapshot.cmdr; //remove temporary field from snapshot
        delete snapshot._changed; //remove temporary field from snapshot
        await db.users.save(snapshot);
        this._changed = false;
    }

    async cmdr_update(cmdr_name, gv, lng) {
        if (this.cmdr_name !== cmdr_name) {
            await this.set_cmdr(cmdr_name);
            this._changed = true;
        }
        if (this.gv !== gv || this.lng !== lng) {
            this.gv = gv;
            this.lng = lng;
            this._changed = true;
        }
        return this.save();
    }

    async set_cmdr(cmdr_name) {
        if (!cmdr_name) return;

        //get commander with all the things
        if (this.cmdr) await this.cmdr.save();

        let c = await db.cmdrs.findOne({uid: this._id, name: cmdr_name});

        if (c) {
            this.cmdr = new CMDR(c);
            this.cmdr_name = c.name;
        } else {
            this.cmdr = new CMDR({
                _id: db.gen_id(),
                uid: this._id,
                name: cmdr_name,
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
        this._changed = false;
        this.uid = null;
        this.name = null;
        this.loc = {
            system: {name: null, coord: [0, 0, 0]},
            body: {name: null, r: 0, g: 0, scanned: false}
        };
        extend(this, cmdr_data);
    }

    async save() {
        if (!this._changed) return;
        if (!this._id || !this.uid) return;
        let snapshot = {};
        extend(snapshot, this);
        delete snapshot._changed;
        await db.cmdrs.save(snapshot);
        this._changed = false;
    }

}

const UNI = new Universe();
module.exports = UNI;


